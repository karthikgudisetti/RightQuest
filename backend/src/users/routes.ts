import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { publicUser } from '../auth/routes.js';
import { levelFromXp, levelName } from '../config/gamification.js';

export const usersRouter = Router();

usersRouter.get('/me', authRequired, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user: publicUser(user) });
});

usersRouter.patch(
  '/me',
  authRequired,
  validateBody(
    z.object({
      name: z.string().min(2).optional(),
      preferredLanguage: z.enum(['en', 'hi']).optional(),
      ageGroup: z.string().optional(),
      avatar: z.string().optional(),
    })
  ),
  async (req: AuthedRequest, res) => {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
    });
    res.json({ user: publicUser(user) });
  }
);

usersRouter.get('/me/progress', authRequired, async (req: AuthedRequest, res) => {
  const progress = await prisma.userProgress.findMany({
    where: { userId: req.user!.id },
    include: { module: true },
    orderBy: { startedAt: 'desc' },
  });
  res.json({ progress });
});

usersRouter.get('/me/badges', authRequired, async (req: AuthedRequest, res) => {
  const badges = await prisma.userBadge.findMany({
    where: { userId: req.user!.id },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  });
  res.json({ badges });
});

usersRouter.get('/me/stats', authRequired, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const [modulesCompleted, badges, quizAttempts, scenarios] = await Promise.all([
    prisma.userProgress.count({ where: { userId: user.id, completedAt: { not: null } } }),
    prisma.userBadge.count({ where: { userId: user.id } }),
    prisma.quizAttempt.findMany({ where: { userId: user.id } }),
    prisma.scenarioAttempt.count({ where: { userId: user.id } }),
  ]);
  const avgScore =
    quizAttempts.length === 0
      ? 0
      : quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length;
  const lvl = levelFromXp(user.xp);
  res.json({
    xp: user.xp,
    level: user.level,
    levelName: levelName(user.level) || lvl.name,
    currentStreak: user.currentStreak,
    modulesCompleted,
    badges,
    avgQuizScore: Math.round(avgScore),
    scenariosCompleted: scenarios,
  });
});
