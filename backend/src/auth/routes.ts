import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { validateBody } from '../middleware/validate.js';
import {
  AuthUser,
  AuthedRequest,
  authRequired,
  signAccessToken,
  signRefreshToken,
} from '../middleware/auth.js';
import { levelFromXp, levelName } from '../config/gamification.js';

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  preferredLanguage: z.enum(['en', 'hi']).optional(),
  ageGroup: z.string().optional(),
  role: z.enum(['CHILD', 'ADMIN', 'CONTENT_REVIEWER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), async (req, res) => {
  const { name, email, password, preferredLanguage, ageGroup, role } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  // Only allow ADMIN via seed in demo; public register is CHILD only
  const safeRole = role === 'ADMIN' ? 'CHILD' : role ?? 'CHILD';
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      preferredLanguage: preferredLanguage ?? 'en',
      ageGroup,
      role: safeRole,
    },
  });

  const authUser: AuthUser = { id: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  res.status(201).json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

authRouter.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const authUser: AuthUser = { id: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  res.json({ user: publicUser(user), accessToken, refreshToken });
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as AuthUser;
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const accessToken = signAccessToken({ id: payload.id, role: payload.role, email: payload.email });
    res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.post('/logout', authRequired, async (req: AuthedRequest, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId: req.user!.id } });
  }
  res.json({ ok: true });
});

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  preferredLanguage: string;
  ageGroup: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  currentStreak: number;
}) {
  const lvl = levelFromXp(user.xp);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    ageGroup: user.ageGroup,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    levelName: levelName(user.level) || lvl.name,
    currentStreak: user.currentStreak,
  };
}

export { publicUser };
