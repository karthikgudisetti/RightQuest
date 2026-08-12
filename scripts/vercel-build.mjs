import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backend = join(root, 'backend');
const postgresSchema = join(backend, 'prisma', 'schema.postgres.prisma');

function run(cmd, args, cwd, env = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

const usePostgres = Boolean(process.env.VERCEL || process.env.USE_POSTGRES === '1');

if (usePostgres) {
  if (!existsSync(postgresSchema)) {
    console.error('Missing backend/prisma/schema.postgres.prisma');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required for Vercel (use Neon/Postgres connection string).');
    process.exit(1);
  }
  console.log('Generating Prisma client for PostgreSQL…');
  run('npx', ['prisma', 'generate', '--schema=prisma/schema.postgres.prisma'], backend);
} else {
  run('npx', ['prisma', 'generate'], backend);
}

run('npm', ['run', 'build', '--workspace=backend'], root);
run('npm', ['run', 'build', '--workspace=frontend'], root);

if (!existsSync(join(backend, 'dist', 'app.js'))) {
  console.error('Backend build missing dist/app.js');
  process.exit(1);
}

console.log('Vercel build complete.');
