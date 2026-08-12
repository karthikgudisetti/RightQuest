import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired } from '../middleware/auth.js';
import { levelFromXp, levelName, LEVELS, XP } from '../config/gamification.js';
import { awardXpAndRefresh } from '../services/gamificationService.js';
import { paramId } from '../utils/params.js';

export const gamificationRouter = Router();

gamificationRouter.get('/profile', authRequired, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const lvl = levelFromXp(user.xp);
  const next = LEVELS.find((l) => l.minXp > user.xp);
  res.json({
    xp: user.xp,
    level: user.level,
    levelName: levelName(user.level) || lvl.name,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    nextLevelAt: next?.minXp ?? null,
    xpToNext: next ? next.minXp - user.xp : 0,
    levels: LEVELS,
    xpRewards: XP,
  });
});

gamificationRouter.get('/badges', authRequired, async (req: AuthedRequest, res) => {
  const [all, owned] = await Promise.all([
    prisma.badge.findMany({ orderBy: { name: 'asc' } }),
    prisma.userBadge.findMany({ where: { userId: req.user!.id } }),
  ]);
  const ownedSet = new Set(owned.map((o) => o.badgeId));
  res.json({
    badges: all.map((b) => ({
      ...b,
      earned: ownedSet.has(b.id),
      earnedAt: owned.find((o) => o.badgeId === b.id)?.earnedAt ?? null,
    })),
  });
});

gamificationRouter.get('/challenges', authRequired, async (_req, res) => {
  const challenge = await prisma.dailyChallenge.findFirst({
    where: { isActive: true },
    orderBy: { challengeDate: 'desc' },
  });
  res.json({ challenge });
});

gamificationRouter.post('/challenges/:id/complete', authRequired, async (req: AuthedRequest, res) => {
  const challenge = await prisma.dailyChallenge.findUnique({ where: { id: paramId(req.params.id) } });
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  const reward = await awardXpAndRefresh(req.user!.id, challenge.xpReward);
  res.json({ message: 'Mission complete!', reward });
});

// Soft personal milestones instead of public leaderboard
gamificationRouter.get('/leaderboard', authRequired, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const milestones = [
    { name: 'First 50 XP', reached: user.xp >= 50 },
    { name: 'Reach Learner', reached: user.level >= 2 },
    { name: 'Reach Rights Seeker', reached: user.level >= 3 },
    { name: '200 XP Club', reached: user.xp >= 200 },
  ];
  res.json({ milestones, note: 'Personal milestones keep learning supportive for children.' });
});
