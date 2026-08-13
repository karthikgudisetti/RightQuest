# RightsQuest India

Gamified children's rights legal literacy platform (hackathon MVP).

Educational awareness tool only — not a lawyer, counsellor, or emergency service.

## Quick start

```bash
npm run setup
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

## Demo accounts

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Child | child@demo.com  | demo1234  |
| Admin | admin@demo.com  | demo1234  |

## National UI (ages 8–16)

One polished India-themed experience for every learner. Language switch stays in the top bar (EN / हिन्दी / తెలుగు).


## 5-minute demo path

1. Log in as `child@demo.com`
2. Onboarding → enter RightsQuest
3. Home → **Play games** → Word Hunt (tap letters, clear levels)
4. Try **Safe Trail** or **Safety Stars** → Next puzzle
5. Story TV → safe choice
6. **Videos** → Watch UNICEF / Childline films → “I learned this”
7. **Rights** → 8 key child rights (RTE, POCSO, safety)
8. **Help** → National helplines (1098, NCPCR, 1930)
9. Quiz + badges → AI Tutor → **Print certificate** on Progress
10. Admin login → edit a module → refresh child Learn

## Stack

- React + Vite + Tailwind CSS + Zustand
- Node.js + Express + TypeScript
- Prisma + SQLite (Postgres-ready)
- JWT auth + RBAC
- Optional `OPENAI_API_KEY` for live ChatGPT-style RightsQuest Buddy tutor

## AI Tutor

Set `OPENAI_API_KEY` in `backend/.env` for live GPT replies (scoped to children’s rights only). Without a key, the tutor still answers from the approved knowledge base in a friendly chat UI.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + web |
| `npm run db:push` | Sync Prisma schema |
| `npm run db:seed` | Reseed demo content |
| `npm run setup` | Install + push + seed |

## Deploy (Vercel)

See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** — frontend + API on Vercel with Neon Postgres.

## Out of scope (later)

Teacher/parent dashboards, Redis, true vector RAG, React Native, offline PWA sync.
