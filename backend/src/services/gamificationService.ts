import { prisma } from '../config/prisma.js';
import { levelFromXp } from '../config/gamification.js';
import { RequirementType } from '@prisma/client';

export async function awardXp(userId: string, amount: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
  const lvl = levelFromXp(user.xp);
  if (lvl.level !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: lvl.level },
    });
  }
  await touchStreak(userId);
  const unlocked = await checkAndAwardBadges(userId);
  return { xpAwarded: amount, totalXp: user.xp + (user.xp === undefined ? 0 : 0), unlockedBadges: unlocked };
}

async function touchStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  let currentStreak = user.currentStreak;
  if (!last) {
    currentStreak = 1;
  } else {
    const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);
    if (diffDays === 0) {
      // already counted today
    } else if (diffDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1; // soft reset, no punishment messaging
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak: Math.max(user.longestStreak, currentStreak),
      lastActivityDate: new Date(),
    },
  });
}

export async function checkAndAwardBadges(userId: string) {
  const [user, badges, owned, lessonsDone, quizAttempts, scenarioAttempts, progress] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId } }),
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.quizAttempt.findMany({ where: { userId } }),
    prisma.scenarioAttempt.findMany({ where: { userId } }),
    prisma.userProgress.findMany({ where: { userId, completedAt: { not: null } }, include: { module: true } }),
  ]);

  if (!user) return [];

  const ownedIds = new Set(owned.map((b) => b.badgeId));
  const unlocked: { id: string; name: string; icon: string }[] = [];

  const totalLessons = lessonsDone.reduce((s, p) => s + p.lessonsCompleted, 0);
  const highQuizzes = quizAttempts.filter((q) => q.percentage >= 80).length;
  const perfectQuizzes = quizAttempts.filter((q) => q.isPerfect).length;
  const completedModules = progress.length;
  const categories = new Set(progress.map((p) => p.module.category));
  const scenariosDone = scenarioAttempts.length;

  for (const badge of badges) {
    if (ownedIds.has(badge.id)) continue;
    let ok = false;
    switch (badge.requirementType as RequirementType) {
      case 'FIRST_LESSON':
        ok = totalLessons >= badge.requirementValue;
        break;
      case 'QUIZ_STREAK':
        ok = highQuizzes >= badge.requirementValue;
        break;
      case 'MODULES_COUNT':
        ok = completedModules >= badge.requirementValue;
        break;
      case 'MODULE_CATEGORY':
        ok = categories.has(badge.category ?? '') || categories.size >= badge.requirementValue;
        break;
      case 'PERFECT_QUIZ':
        ok = perfectQuizzes >= badge.requirementValue;
        break;
      case 'SCENARIOS_COUNT':
        ok = scenariosDone >= badge.requirementValue;
        break;
    }
    if (ok) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      unlocked.push({ id: badge.id, name: badge.name, icon: badge.icon });
    }
  }
  return unlocked;
}

export async function awardXpAndRefresh(userId: string, amount: number) {
  const before = await prisma.user.findUnique({ where: { id: userId } });
  if (!before) throw new Error('User not found');
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
  const after = await prisma.user.findUnique({ where: { id: userId } });
  const lvl = levelFromXp(after!.xp);
  await prisma.user.update({
    where: { id: userId },
    data: { level: lvl.level },
  });
  await touchStreak(userId);
  const unlockedBadges = await checkAndAwardBadges(userId);
  return {
    xpAwarded: amount,
    totalXp: after!.xp,
    level: lvl.level,
    levelName: lvl.name,
    unlockedBadges,
  };
}
