import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { XP } from '../config/gamification.js';
import { awardXpAndRefresh } from '../services/gamificationService.js';
import { paramId } from '../utils/params.js';

export const quizzesRouter = Router();

quizzesRouter.get('/:id', authRequired, async (req: AuthedRequest, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: paramId(req.params.id) },
    include: {
      questions: {
        orderBy: { sequenceNumber: 'asc' },
        include: {
          answers: {
            select: { id: true, answerText: true },
          },
        },
      },
      module: { select: { id: true, title: true } },
    },
  });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ quiz });
});

quizzesRouter.post(
  '/:id/submit',
  authRequired,
  validateBody(
    z.object({
      answers: z.array(
        z.object({
          questionId: z.string(),
          answerId: z.string(),
        })
      ),
    })
  ),
  async (req: AuthedRequest, res) => {
    const quiz = await prisma.quiz.findUnique({
      where: { id: paramId(req.params.id) },
      include: { questions: { include: { answers: true } } },
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let correct = 0;
    const breakdown = quiz.questions.map((q) => {
      const submitted = req.body.answers.find((a: { questionId: string }) => a.questionId === q.id);
      const chosen = q.answers.find((a) => a.id === submitted?.answerId);
      const right = q.answers.find((a) => a.isCorrect);
      const isCorrect = Boolean(chosen?.isCorrect);
      if (isCorrect) correct += 1;
      return {
        questionId: q.id,
        question: q.question,
        isCorrect,
        explanation: chosen?.explanation || right?.explanation || '',
        correctAnswerId: right?.id,
      };
    });

    const total = quiz.questions.length || 1;
    const percentage = Math.round((correct / total) * 100);
    const isPerfect = percentage === 100;
    let xp = correct * XP.QUIZ_ANSWER;
    if (isPerfect) xp += XP.PERFECT_QUIZ;

    const reward = await awardXpAndRefresh(req.user!.id, xp);
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user!.id,
        quizId: quiz.id,
        score: correct,
        total,
        percentage,
        xpEarned: xp,
        isPerfect,
      },
    });

    const progress = await prisma.userProgress.upsert({
      where: { userId_moduleId: { userId: req.user!.id, moduleId: quiz.moduleId } },
      create: {
        userId: req.user!.id,
        moduleId: quiz.moduleId,
        quizScore: percentage,
        xpEarned: xp,
        completionPercentage: percentage >= quiz.passingScore ? 100 : 70,
        completedAt: percentage >= quiz.passingScore ? new Date() : null,
      },
      update: {
        quizScore: percentage,
        xpEarned: { increment: xp },
        completionPercentage: percentage >= quiz.passingScore ? 100 : undefined,
        completedAt: percentage >= quiz.passingScore ? new Date() : undefined,
      },
    });

    // module completion XP once when first completing via quiz
    let moduleReward = null;
    if (percentage >= quiz.passingScore && !progress.completedAt) {
      moduleReward = await awardXpAndRefresh(req.user!.id, XP.MODULE);
    }

    res.json({
      result: {
        score: correct,
        total,
        percentage,
        passed: percentage >= quiz.passingScore,
        isPerfect,
        breakdown,
      },
      attempt,
      reward,
      moduleReward,
    });
  }
);

quizzesRouter.get('/:id/result', authRequired, async (req: AuthedRequest, res) => {
  const attempt = await prisma.quizAttempt.findFirst({
    where: { quizId: paramId(req.params.id), userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  if (!attempt) return res.status(404).json({ error: 'No attempt found' });
  res.json({ attempt });
});
