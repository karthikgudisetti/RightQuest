import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 4000;

// Local / traditional host only — Vercel uses the exported app as a serverless function
if (!process.env.VERCEL) {
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
}

export default app;
