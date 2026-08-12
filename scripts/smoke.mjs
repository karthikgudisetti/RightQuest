/**
 * RightsQuest smoke test — run twice to verify core APIs.
 * Usage: node scripts/smoke.mjs
 */
const API = process.env.API || 'http://localhost:4000';

async function req(path, opts = {}, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${API}${path}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          ...(opts.headers || {}),
        },
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

async function runPass(label) {
  const results = [];
  const check = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  };

  console.log(`\n=== ${label} ===`);

  const health = await req('/health');
  check('GET /health', health.ok && health.data?.ok === true, `status ${health.status}`);

  const login = await req('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'child@demo.com', password: 'demo1234' }),
  });
  check('POST /auth/login (child)', login.ok && !!login.data?.accessToken, `status ${login.status}`);
  const token = login.data?.accessToken;
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

  const me = await req('/api/v1/users/me', { headers: auth });
  check('GET /users/me', me.ok && me.data?.user?.email === 'child@demo.com');

  const modules = await req('/api/v1/modules?lang=en', { headers: auth });
  check('GET /modules', modules.ok && (modules.data?.modules?.length || 0) > 0, `count ${modules.data?.modules?.length}`);

  const modId = modules.data?.modules?.[0]?.id;
  let quizId = modules.data?.modules?.flatMap((m) => m.quizzes || [])?.[0]?.id;
  if (modId) {
    const mod = await req(`/api/v1/modules/${modId}?lang=en`, { headers: auth });
    check('GET /modules/:id', mod.ok && (mod.data?.module?.lessons?.length || 0) > 0);
    const hasVideo = (modules.data?.modules || []).length > 0 &&
      (await Promise.all(
        (modules.data?.modules || []).slice(0, 5).map(async (m) => {
          const d = await req(`/api/v1/modules/${m.id}?lang=en`, { headers: auth });
          return d.data?.module?.lessons?.some((l) => l.videoUrl);
        })
      )).some(Boolean);
    check('Lesson videoUrl present (seed)', !!hasVideo);
    if (!quizId) quizId = mod.data?.module?.quizzes?.[0]?.id;
  } else {
    check('GET /modules/:id', false, 'no module id');
    check('Lesson videoUrl present (seed)', false, 'no modules');
  }

  const scenarios = await req('/api/v1/scenarios?lang=en', { headers: auth });
  check(
    'GET /scenarios',
    scenarios.ok && (scenarios.data?.scenarios?.length || 0) > 0,
    `count ${scenarios.data?.scenarios?.length}`
  );

  if (quizId) {
    const quiz = await req(`/api/v1/quizzes/${quizId}`, { headers: auth });
    check('GET /quizzes/:id', quiz.ok, `status ${quiz.status}`);
  } else {
    check('GET /quizzes/:id', false, 'no quiz id found');
  }

  const challenges = await req('/api/v1/gamification/challenges', { headers: auth });
  check('GET /gamification/challenges', challenges.ok);

  const badges = await req('/api/v1/gamification/badges', { headers: auth });
  check('GET /gamification/badges', badges.ok);

  const tutor = await req('/api/v1/ai/tutor', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      question: 'What are children rights?',
      language: 'en',
      history: [],
    }),
  });
  check('POST /ai/tutor', tutor.ok && typeof tutor.data?.answer === 'string' && tutor.data.answer.length > 10, `len ${tutor.data?.answer?.length || 0}`);

  const adminLogin = await req('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@demo.com', password: 'demo1234' }),
  });
  check('POST /auth/login (admin)', adminLogin.ok && !!adminLogin.data?.accessToken);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${label} summary: ${results.length - failed.length}/${results.length} passed`);
  return failed.length === 0;
}

async function main() {
  const fe = await fetch('http://localhost:5173').then((r) => r.status).catch(() => 0);
  console.log(`Frontend http://localhost:5173 → ${fe}`);
  if (fe !== 200) {
    console.error('Frontend not reachable');
    process.exit(1);
  }

  const pass1 = await runPass('PASS 1');
  const pass2 = await runPass('PASS 2 (repeat)');

  if (!pass1 || !pass2) {
    console.error('\nSmoke tests FAILED');
    process.exit(1);
  }
  console.log('\nAll smoke tests PASSED twice.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
