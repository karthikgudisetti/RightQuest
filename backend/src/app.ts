import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './auth/routes.js';
import { usersRouter } from './users/routes.js';
import { learningRouter } from './learning/routes.js';
import { scenariosRouter } from './scenarios/routes.js';
import { quizzesRouter } from './quizzes/routes.js';
import { gamificationRouter } from './gamification/routes.js';
import { aiRouter } from './ai/routes.js';
import { adminRouter } from './admin/routes.js';

export const app = express();
app.set('trust proxy', 1);

function isAllowedOrigin(origin?: string | null) {
  if (!origin) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
  if (/\.vercel\.app$/i.test(origin)) return true;
  const extra = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return extra.includes(origin);
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, cb) => {
      cb(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'RightsQuest API' }));

app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1', learningRouter);
app.use('/api/v1/scenarios', scenariosRouter);
app.use('/api/v1/quizzes', quizzesRouter);
app.use('/api/v1/gamification', gamificationRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/admin', adminRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
