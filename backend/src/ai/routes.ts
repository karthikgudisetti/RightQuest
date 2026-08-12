import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const aiRouter = Router();

const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const CRISIS_PATTERNS = [
  /hurt(ing)?\s+me/i,
  /abus(e|ing|ed)/i,
  /touch(ed|ing)?\s+me/i,
  /suicid/i,
  /kill\s+(my|me)/i,
  /unsafe\s+at\s+home/i,
  /someone\s+is\s+hurting/i,
  /threaten/i,
  /scared\s+for\s+my\s+life/i,
];

const SAFEGUARDING_RESPONSE = {
  answer:
    'Thank you for sharing something important. You are not alone. Please talk to a trusted adult — a parent, teacher, school counsellor, or relative — as soon as you can. In India, you or a trusted adult can also call Childline at 1098 for help. This app cannot replace emergency or child-protection services.',
  topic: 'Safety Support',
  sources: [{ title: 'Childline India', ref: '1098' }],
  safety_notice: true,
  disclaimer:
    'RightsQuest is an educational tool, not a lawyer, counsellor, or emergency service.',
};

function classifyIntent(question: string): 'crisis' | 'learning' {
  if (CRISIS_PATTERNS.some((p) => p.test(question))) return 'crisis';
  return 'learning';
}

async function findKnowledge(question: string, language: string) {
  const entries = await prisma.knowledgeBase.findMany({
    where: { status: 'APPROVED', language: language === 'hi' ? 'hi' : 'en' },
  });
  const q = question.toLowerCase();
  let best = null as (typeof entries)[0] | null;
  let bestScore = 0;
  for (const e of entries) {
    const keys = e.keywords.toLowerCase().split(',').map((k) => k.trim()).filter(Boolean);
    let score = 0;
    for (const k of keys) {
      if (q.includes(k)) score += k.length;
    }
    if (e.topic.toLowerCase().split(' ').some((w) => q.includes(w) && w.length > 3)) score += 3;
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }
  if (!best || bestScore === 0) {
    // fallback to English if Hindi miss
    if (language === 'hi') return findKnowledge(question, 'en');
    return null;
  }
  return best;
}

async function maybePolish(text: string, question: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return text;
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You are RightsQuest, a child-friendly educational tutor for children\'s rights in India. Rewrite the approved explanation in simple warm language for ages 10-14. Do NOT invent laws. Do NOT act as a lawyer. Encourage talking to a trusted adult when helpful. Keep under 120 words.',
          },
          {
            role: 'user',
            content: `Child question: ${question}\n\nApproved explanation (must stay faithful):\n${text}`,
          },
        ],
      }),
    });
    if (!resp.ok) return text;
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || text;
  } catch {
    return text;
  }
}

aiRouter.post(
  '/tutor',
  authRequired,
  aiLimiter,
  validateBody(
    z.object({
      question: z.string().min(3).max(500),
      language: z.enum(['en', 'hi']).optional(),
    })
  ),
  async (req: AuthedRequest, res) => {
    const { question, language } = req.body as { question: string; language?: 'en' | 'hi' };
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const lang = language || user?.preferredLanguage || 'en';

    if (classifyIntent(question) === 'crisis') {
      return res.json(SAFEGUARDING_RESPONSE);
    }

    const kb = await findKnowledge(question, lang);
    if (!kb) {
      return res.json({
        answer:
          lang === 'hi'
            ? 'मुझे इस विषय पर अभी स्वीकृत जानकारी नहीं मिली। कृपया अपने शिक्षक या किसी भरोसेमंद वयस्क से पूछें, या ऐप में संबंधित पाठ पूरा करें।'
            : 'I do not have approved information on that topic yet. Please ask a teacher or trusted adult, or explore a related learning module in the app.',
        topic: 'Unknown',
        sources: [],
        safety_notice: false,
        disclaimer:
          'RightsQuest is an educational tool, not a lawyer or emergency service. Always check with a trusted adult for personal situations.',
      });
    }

    const polished = await maybePolish(kb.simpleExplanation, question);
    res.json({
      answer: polished,
      topic: kb.topic,
      sources: [
        {
          title: kb.source || kb.topic,
          ref: kb.legalReference,
          url: kb.sourceUrl,
        },
      ].filter((s) => s.title),
      safety_notice: false,
      disclaimer:
        'This is educational information only — not legal advice. Talk to a trusted adult if you need help.',
    });
  }
);
