import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../config/prisma.js';
import { AuthedRequest, authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const aiRouter = Router();

const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
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
  /चोट|छू|मार|डर|खतरा|दुरुपयोग/i,
  /హాని|భయం|ముట్టు|కొట్టు|ప్రమాదం/i,
];

function safeguarding(lang: string) {
  if (lang === 'hi') {
    return {
      answer:
        'आपने कुछ बहुत ज़रूरी बात कही। आप अकेले नहीं हैं। कृपया जल्दी किसी भरोसेमंद वयस्क — माता-पिता, शिक्षक, काउंसलर — से बात करें। भारत में चाइल्डलाइन 1098 पर भी कॉल कर सकते हैं। यह ऐप आपातकालीन सेवा नहीं है।',
      topic: 'Safety Support',
      sources: [{ title: 'Childline India', ref: '1098' }],
      safety_notice: true,
    };
  }
  if (lang === 'te') {
    return {
      answer:
        'మీరు చాలా ముఖ్యమైన విషయం చెప్పారు. మీరు ఒంటరిగా లేరు. దయచేసి నమ్మకమైన పెద్దవారితో — తల్లిదండ్రులు, టీచర్, కౌన్సెలర్ — వెంటనే మాట్లాడండి. భారత్‌లో చైల్డ్‌లైన్ 1098కి కాల్ చేయవచ్చు. ఈ యాప్ అత్యవసర సేవ కాదు.',
      topic: 'Safety Support',
      sources: [{ title: 'Childline India', ref: '1098' }],
      safety_notice: true,
    };
  }
  return {
    answer:
      'Thank you for sharing something important. You are not alone. Please talk to a trusted adult — a parent, teacher, school counsellor, or relative — as soon as you can. In India, you or a trusted adult can also call Childline at 1098 for help. This app cannot replace emergency or child-protection services.',
    topic: 'Safety Support',
    sources: [{ title: 'Childline India', ref: '1098' }],
    safety_notice: true,
  };
}

function systemPrompt(lang: string) {
  const langLine =
    lang === 'hi'
      ? 'Reply in simple Hindi (Devanagari).'
      : lang === 'te'
        ? 'Reply in simple Telugu (Telugu script).'
        : 'Reply in simple clear English.';

  return `You are "RightsQuest Buddy", a warm friendly AI tutor for children (ages 8–16) in India.

SCOPE — ONLY talk about:
- Children's rights (UNCRC, Indian child rights awareness)
- Right to education, safety, health, play, voice, protection
- Online safety (passwords, strangers, OTP, cyberbullying)
- Kindness, bullying, asking for help
- Childline 1098 and trusted adults
- Gentle problem-solving for everyday school/home/online situations related to rights and safety
- Short introductions to what rights are

OUT OF SCOPE — politely refuse and redirect:
- Homework for unrelated subjects, coding, celebrity gossip, jokes that are not educational
- Legal advice, medical diagnosis, or acting as a lawyer/doctor/counsellor
- Adult or sexual content (except age-appropriate safe/unsafe touch education)
- Anything harmful

STYLE:
- Friendly, calm, encouraging — like a kind teacher
- Short paragraphs, easy words, under 160 words
- End with one helpful next step when useful
- Remind: talk to a trusted adult for personal problems
- ${langLine}
- Never invent specific court cases or fake laws
- Educational tool only — not emergency help`;
}

async function findKnowledge(question: string, language: string) {
  const entries = await prisma.knowledgeBase.findMany({
    where: {
      status: 'APPROVED',
      OR: [{ language: language === 'hi' ? 'hi' : 'en' }, { language: 'en' }],
    },
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
  if ((!best || bestScore === 0) && language === 'hi') return findKnowledge(question, 'en');
  if (!best || bestScore === 0) return null;
  return best;
}

function offlineAnswer(question: string, lang: string, kb: Awaited<ReturnType<typeof findKnowledge>>) {
  if (kb) {
    return kb.simpleExplanation;
  }
  const lower = question.toLowerCase();
  const aboutRights =
    /right|rights|safe|safety|school|education|help|1098|bully|password|otp|child|online|touch|protect|अधिकार|सुरक्षा|मदद|హక్కు|భద్రత/.test(
      lower
    );

  if (lang === 'hi') {
    return aboutRights
      ? 'मैं बच्चों के अधिकारों पर मदद करता हूँ — शिक्षा, सुरक्षा, ऑनलाइन सावधानी और मदद माँगना। अपना सवाल थोड़ा और साफ़ लिखो, या ऐप में Learn/Videos देखो। ज़रूरत हो तो भरोसेमंद वयस्क या 1098 से बात करो।'
      : 'मैं सिर्फ़ बच्चों के अधिकार, सुरक्षा और मदद से जुड़े सवालों का जवाब दे सकता हूँ। शिक्षा का अधिकार, ऑनलाइन सुरक्षा या 1098 के बारे में पूछो!';
  }
  if (lang === 'te') {
    return aboutRights
      ? 'నేను బాల హక్కులపై సహాయం చేస్తాను — విద్య, భద్రత, ఆన్‌లైన్ జాగ్రత్త, సహాయం అడగడం. మీ ప్రశ్నను స్పష్టంగా రాయండి, లేదా Learn/Videos చూడండి. అవసరమైతే నమ్మకమైన పెద్దవారు లేదా 1098.'
      : 'నేను బాల హక్కులు, భద్రత, సహాయం గురించి మాత్రమే సమాధానం ఇస్తాను. విద్యా హక్కు, ఆన్‌లైన్ భద్రత లేదా 1098 గురించి అడగండి!';
  }
  return aboutRights
    ? 'I help with children’s rights — education, safety, online care, and asking for help. Try asking more clearly, or open Learn / Videos in the app. For personal worries, tell a trusted adult or call Childline 1098.'
    : 'I can only chat about children’s rights, safety, and getting help. Ask about the right to education, online safety, bullying, or Childline 1098!';
}

async function chatWithOpenAI(
  question: string,
  lang: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  kbContext: string | null
) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt(lang) },
  ];

  if (kbContext) {
    messages.push({
      role: 'system',
      content: `Approved knowledge base excerpt (stay faithful; simplify for the child):\n${kbContext}`,
    });
  }

  for (const h of history.slice(-8)) {
    messages.push({ role: h.role, content: h.content });
  }
  messages.push({ role: 'user', content: question });

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.45,
        max_tokens: 280,
        messages,
      }),
    });
    if (!resp.ok) {
      console.warn('OpenAI tutor error', resp.status, await resp.text());
      return null;
    }
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('OpenAI tutor failed', err);
    return null;
  }
}

aiRouter.post(
  '/tutor',
  authRequired,
  aiLimiter,
  validateBody(
    z.object({
      question: z.string().min(1).max(800),
      language: z.enum(['en', 'hi', 'te']).optional(),
      history: z
        .array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string().max(2000),
          })
        )
        .max(12)
        .optional(),
    })
  ),
  async (req: AuthedRequest, res) => {
    const { question, language, history = [] } = req.body as {
      question: string;
      language?: 'en' | 'hi' | 'te';
      history?: { role: 'user' | 'assistant'; content: string }[];
    };
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const lang = language || (user?.preferredLanguage as 'en' | 'hi' | 'te') || 'en';

    if (CRISIS_PATTERNS.some((p) => p.test(question))) {
      return res.json({
        ...safeguarding(lang),
        disclaimer:
          'RightsQuest is an educational tool, not a lawyer, counsellor, or emergency service.',
      });
    }

    const kb = await findKnowledge(question, lang);
    const kbContext = kb
      ? `Topic: ${kb.topic}\nExplanation: ${kb.simpleExplanation}\nSource: ${kb.source || 'Approved KB'}\nLegal ref: ${kb.legalReference || 'n/a'}`
      : null;

    const aiAnswer = await chatWithOpenAI(question, lang, history, kbContext);
    const answer = aiAnswer || offlineAnswer(question, lang, kb);

    res.json({
      answer,
      topic: kb?.topic || 'Children\'s Rights',
      sources: kb
        ? [
            {
              title: kb.source || kb.topic,
              ref: kb.legalReference,
              url: kb.sourceUrl,
            },
          ].filter((s) => s.title)
        : [{ title: 'RightsQuest educational guide', ref: null }],
      safety_notice: false,
      ai: Boolean(aiAnswer),
      disclaimer:
        'Educational information only — not legal advice. Talk to a trusted adult if you need help. Childline 1098.',
    });
  }
);
