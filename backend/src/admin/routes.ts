import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { paramId } from '../utils/params.js';

export const adminRouter = Router();

adminRouter.use(authRequired, requireRoles('ADMIN', 'CONTENT_REVIEWER'));

adminRouter.get('/analytics', async (_req, res) => {
  const [learners, modulesCompleted, quizAttempts, scenarioAttempts, badgesEarned] =
    await Promise.all([
      prisma.user.count({ where: { role: 'CHILD' } }),
      prisma.userProgress.count({ where: { completedAt: { not: null } } }),
      prisma.quizAttempt.findMany(),
      prisma.scenarioAttempt.count(),
      prisma.userBadge.count(),
    ]);
  const avgScore =
    quizAttempts.length === 0
      ? 0
      : Math.round(quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length);
  res.json({
    totalLearners: learners,
    modulesCompleted,
    averageQuizScore: avgScore,
    scenarioCompletions: scenarioAttempts,
    badgesEarned,
  });
});

adminRouter.get('/modules', async (_req, res) => {
  const modules = await prisma.learningModule.findMany({
    orderBy: { sequenceNumber: 'asc' },
    include: {
      _count: { select: { lessons: true, scenarios: true, quizzes: true } },
    },
  });
  res.json({ modules });
});

adminRouter.patch(
  '/modules/:id',
  validateBody(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
      estimatedMinutes: z.number().optional(),
      difficulty: z.string().optional(),
    })
  ),
  async (req, res) => {
    const module = await prisma.learningModule.update({
      where: { id: paramId(req.params.id) },
      data: req.body,
    });
    res.json({ module });
  }
);

adminRouter.post(
  '/modules',
  validateBody(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      ageGroup: z.string(),
      difficulty: z.string().default('Beginner'),
      estimatedMinutes: z.number().default(15),
      sequenceNumber: z.number().default(0),
    })
  ),
  async (req, res) => {
    const module = await prisma.learningModule.create({ data: { ...req.body, status: 'PUBLISHED' } });
    res.status(201).json({ module });
  }
);

adminRouter.get('/scenarios', async (_req, res) => {
  const scenarios = await prisma.scenario.findMany({
    include: { choices: true, module: { select: { title: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ scenarios });
});

adminRouter.patch(
  '/scenarios/:id',
  validateBody(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      story: z.string().optional(),
    })
  ),
  async (req, res) => {
    const scenario = await prisma.scenario.update({ where: { id: paramId(req.params.id) }, data: req.body });
    res.json({ scenario });
  }
);

adminRouter.get('/quizzes', async (_req, res) => {
  const quizzes = await prisma.quiz.findMany({
    include: {
      module: { select: { title: true } },
      _count: { select: { questions: true } },
    },
  });
  res.json({ quizzes });
});

adminRouter.get('/badges', async (_req, res) => {
  const badges = await prisma.badge.findMany();
  res.json({ badges });
});

adminRouter.post(
  '/badges',
  validateBody(
    z.object({
      name: z.string(),
      description: z.string(),
      icon: z.string(),
      requirementType: z.enum([
        'FIRST_LESSON',
        'QUIZ_STREAK',
        'MODULE_CATEGORY',
        'MODULES_COUNT',
        'PERFECT_QUIZ',
        'SCENARIOS_COUNT',
      ]),
      requirementValue: z.number(),
      category: z.string().optional(),
    })
  ),
  async (req, res) => {
    const badge = await prisma.badge.create({ data: req.body });
    res.status(201).json({ badge });
  }
);

adminRouter.get('/knowledge', async (_req, res) => {
  const entries = await prisma.knowledgeBase.findMany({ orderBy: { topic: 'asc' } });
  res.json({ entries });
});

adminRouter.post(
  '/knowledge',
  validateBody(
    z.object({
      topic: z.string(),
      keywords: z.string(),
      simpleExplanation: z.string(),
      legalReference: z.string().optional(),
      source: z.string().optional(),
      sourceUrl: z.string().optional(),
      language: z.enum(['en', 'hi']).default('en'),
      ageGroup: z.string().default('10-14'),
    })
  ),
  async (req: AuthedRequest, res) => {
    const entry = await prisma.knowledgeBase.create({
      data: {
        ...req.body,
        status: 'APPROVED',
        reviewedBy: req.user!.email,
        reviewedAt: new Date(),
      },
    });
    res.status(201).json({ entry });
  }
);

adminRouter.patch(
  '/knowledge/:id',
  validateBody(
    z.object({
      topic: z.string().optional(),
      keywords: z.string().optional(),
      simpleExplanation: z.string().optional(),
      legalReference: z.string().optional(),
      status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
    })
  ),
  async (req, res) => {
    const entry = await prisma.knowledgeBase.update({
      where: { id: paramId(req.params.id) },
      data: req.body,
    });
    res.json({ entry });
  }
);

adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      preferredLanguage: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users });
});
