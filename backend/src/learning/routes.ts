import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired } from '../middleware/auth.js';
import { XP } from '../config/gamification.js';
import { awardXpAndRefresh } from '../services/gamificationService.js';
import { paramId } from '../utils/params.js';

export const learningRouter = Router();

async function withTranslations<T extends { id: string }>(
  items: T[],
  contentType: string,
  language: string,
  fields: string[]
) {
  if (language === 'en' || items.length === 0) return items;
  const ids = items.map((i) => i.id);
  const translations = await prisma.contentTranslation.findMany({
    where: { contentType, contentId: { in: ids }, language },
  });
  const map = new Map<string, Record<string, string>>();
  for (const t of translations) {
    if (!map.has(t.contentId)) map.set(t.contentId, {});
    map.get(t.contentId)![t.field] = t.translatedText;
  }
  return items.map((item) => {
    const tr = map.get(item.id);
    if (!tr) return item;
    const copy: Record<string, unknown> = { ...item };
    for (const f of fields) {
      if (tr[f]) copy[f] = tr[f];
    }
    return copy as T;
  });
}

learningRouter.get('/modules', authRequired, async (req: AuthedRequest, res) => {
  const lang = (req.query.lang as string) || 'en';
  const modules = await prisma.learningModule.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { sequenceNumber: 'asc' },
    include: {
      lessons: { orderBy: { sequenceNumber: 'asc' }, select: { id: true, title: true, sequenceNumber: true } },
      quizzes: { select: { id: true, title: true } },
      scenarios: { select: { id: true, title: true, isDemoPath: true } },
    },
  });
  const localized = await withTranslations(modules, 'module', lang, ['title', 'description']);
  const progress = await prisma.userProgress.findMany({ where: { userId: req.user!.id } });
  const progressMap = new Map(progress.map((p) => [p.moduleId, p]));
  res.json({
    modules: localized.map((m) => ({
      ...m,
      progress: progressMap.get(m.id) ?? null,
    })),
  });
});

learningRouter.get('/modules/:id', authRequired, async (req: AuthedRequest, res) => {
  const lang = (req.query.lang as string) || 'en';
  const module = await prisma.learningModule.findUnique({
    where: { id: paramId(req.params.id) },
    include: {
      lessons: { orderBy: { sequenceNumber: 'asc' } },
      quizzes: { include: { questions: { select: { id: true } } } },
      scenarios: { include: { choices: true } },
    },
  });
  if (!module) return res.status(404).json({ error: 'Module not found' });

  let localized = module;
  if (lang !== 'en') {
    const [modTr, lessonTr] = await Promise.all([
      withTranslations([module], 'module', lang, ['title', 'description']),
      withTranslations(module.lessons, 'lesson', lang, ['title', 'content']),
    ]);
    localized = { ...modTr[0], lessons: lessonTr } as typeof module;
  }

  const progress = await prisma.userProgress.findUnique({
    where: { userId_moduleId: { userId: req.user!.id, moduleId: module.id } },
  });
  res.json({ module: localized, progress });
});

learningRouter.post('/modules/:id/start', authRequired, async (req: AuthedRequest, res) => {
  const module = await prisma.learningModule.findUnique({ where: { id: paramId(req.params.id) } });
  if (!module) return res.status(404).json({ error: 'Module not found' });
  const progress = await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: req.user!.id, moduleId: module.id } },
    create: { userId: req.user!.id, moduleId: module.id },
    update: {},
  });
  res.json({ progress });
});

learningRouter.post('/modules/:id/complete', authRequired, async (req: AuthedRequest, res) => {
  const module = await prisma.learningModule.findUnique({
    where: { id: paramId(req.params.id) },
    include: { lessons: true },
  });
  if (!module) return res.status(404).json({ error: 'Module not found' });

  const progress = await prisma.userProgress.findUnique({
    where: { userId_moduleId: { userId: req.user!.id, moduleId: module.id } },
  });
  if (!progress) return res.status(400).json({ error: 'Start the module first' });
  if (progress.completedAt) return res.json({ progress, alreadyCompleted: true });

  const reward = await awardXpAndRefresh(req.user!.id, XP.MODULE);
  const updated = await prisma.userProgress.update({
    where: { id: progress.id },
    data: {
      completionPercentage: 100,
      completedAt: new Date(),
      xpEarned: { increment: XP.MODULE },
    },
  });
  res.json({ progress: updated, reward });
});

learningRouter.post('/lessons/:id/complete', authRequired, async (req: AuthedRequest, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: paramId(req.params.id) },
    include: { module: { include: { lessons: true } } },
  });
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  let progress = await prisma.userProgress.findUnique({
    where: { userId_moduleId: { userId: req.user!.id, moduleId: lesson.moduleId } },
  });
  if (!progress) {
    progress = await prisma.userProgress.create({
      data: { userId: req.user!.id, moduleId: lesson.moduleId },
    });
  }

  const completedIds: string[] = JSON.parse(progress.completedLessonIds || '[]');
  if (completedIds.includes(lesson.id)) {
    return res.json({ progress, alreadyCompleted: true, reward: null });
  }
  completedIds.push(lesson.id);
  const totalLessons = lesson.module.lessons.length || 1;
  const percentage = Math.min(99, Math.round((completedIds.length / totalLessons) * 100));

  const reward = await awardXpAndRefresh(req.user!.id, XP.LESSON);
  const updated = await prisma.userProgress.update({
    where: { id: progress.id },
    data: {
      completedLessonIds: JSON.stringify(completedIds),
      lessonsCompleted: completedIds.length,
      completionPercentage: percentage,
      xpEarned: { increment: XP.LESSON },
    },
  });

  res.json({ progress: updated, reward });
});
