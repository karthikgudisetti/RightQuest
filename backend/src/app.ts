import 'dotenv/config';
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

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow local Vite ports / same-origin / tools with no Origin
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        cb(null, true);
        return;
      }
      cb(null, false);
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

const server = app.listen(PORT, () => {
  console.log(`RightsQuest API running on http://localhost:${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is busy. Stop the other process and retry.`);
    process.exit(1);
  }
  throw err;
});
