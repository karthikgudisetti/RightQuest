import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { awardXpAndRefresh } from '../services/gamificationService.js';
import { paramId } from '../utils/params.js';

export const scenariosRouter = Router();

scenariosRouter.get('/', authRequired, async (req: AuthedRequest, res) => {
  const scenarios = await prisma.scenario.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      ageGroup: true,
      difficulty: true,
      moduleId: true,
      isDemoPath: true,
      imageUrl: true,
    },
  });
  const lang = (req.query.lang as string) || 'en';
  if (lang !== 'en') {
    const tr = await prisma.contentTranslation.findMany({
      where: {
        contentType: 'scenario',
        contentId: { in: scenarios.map((s) => s.id) },
        language: lang,
        field: { in: ['title', 'description'] },
      },
    });
    const map = new Map<string, Record<string, string>>();
    for (const t of tr) {
      if (!map.has(t.contentId)) map.set(t.contentId, {});
      map.get(t.contentId)![t.field] = t.translatedText;
    }
    return res.json({
      scenarios: scenarios.map((s) => ({ ...s, ...(map.get(s.id) ?? {}) })),
    });
  }
  res.json({ scenarios });
});

scenariosRouter.get('/:id', authRequired, async (req: AuthedRequest, res) => {
  const lang = (req.query.lang as string) || 'en';
  const scenario = await prisma.scenario.findUnique({
    where: { id: paramId(req.params.id) },
    include: {
      choices: {
        select: {
          id: true,
          choiceText: true,
          nextScenarioId: true,
          // hide correctness until answer submitted
        },
      },
      module: { select: { id: true, title: true } },
    },
  });
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

  if (lang !== 'en') {
    const tr = await prisma.contentTranslation.findMany({
      where: {
        OR: [
          { contentType: 'scenario', contentId: scenario.id, language: lang },
          {
            contentType: 'scenario_choice',
            contentId: { in: scenario.choices.map((c) => c.id) },
            language: lang,
          },
        ],
      },
    });
    for (const t of tr) {
      if (t.contentType === 'scenario') {
        (scenario as Record<string, unknown>)[t.field] = t.translatedText;
      } else {
        const choice = scenario.choices.find((c) => c.id === t.contentId);
        if (choice && t.field === 'choiceText') (choice as { choiceText: string }).choiceText = t.translatedText;
      }
    }
  }

  res.json({ scenario });
});

scenariosRouter.post(
  '/:id/answer',
  authRequired,
  validateBody(z.object({ choiceId: z.string() })),
  async (req: AuthedRequest, res) => {
    const scenario = await prisma.scenario.findUnique({
      where: { id: paramId(req.params.id) },
      include: { choices: true },
    });
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const choice = scenario.choices.find((c) => c.id === req.body.choiceId);
    if (!choice) return res.status(400).json({ error: 'Invalid choice' });

    const xp = choice.isCorrect ? choice.xpReward : Math.max(5, Math.floor(choice.xpReward / 4));
    const reward = await awardXpAndRefresh(req.user!.id, xp);

    await prisma.scenarioAttempt.create({
      data: {
        userId: req.user!.id,
        scenarioId: scenario.id,
        choiceId: choice.id,
        isCorrect: choice.isCorrect,
        xpEarned: xp,
      },
    });

    if (scenario.moduleId) {
      await prisma.userProgress.upsert({
        where: { userId_moduleId: { userId: req.user!.id, moduleId: scenario.moduleId } },
        create: {
          userId: req.user!.id,
          moduleId: scenario.moduleId,
          xpEarned: xp,
          completionPercentage: 40,
        },
        update: { xpEarned: { increment: xp } },
      });
    }

    res.json({
      isCorrect: choice.isCorrect,
      explanation: choice.explanation,
      nextScenarioId: choice.nextScenarioId,
      reward,
    });
  }
);
