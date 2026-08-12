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

## 5-minute demo path

1. Log in as `child@demo.com`
2. Complete onboarding (pick age + English/Hindi)
3. Open **Online Safety** from Home / Learn
4. Complete a lesson → earn XP
5. Play demo story **The Friendly Stranger Online** → choose the safe option
6. Take the Online Safety quiz → unlock badges
7. Ask AI Tutor: “What does my right to education mean?”
8. Log out → log in as `admin@demo.com` → edit a module title in Admin CMS
9. Refresh child Learn page to see the update

## Stack

- React + Vite + Tailwind CSS + Zustand
- Node.js + Express + TypeScript
- Prisma + SQLite (Postgres-ready schema)
- JWT auth + RBAC
- AI tutor stub over approved knowledge base (optional `OPENAI_API_KEY`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + web |
| `npm run db:push` | Sync Prisma schema |
| `npm run db:seed` | Reseed demo content |
| `npm run setup` | Install + push + seed |

## MVP included

- Child auth, home, learn, stories, quizzes, badges, progress
- XP / levels / badges
- English + Hindi UI + translated seed content
- Admin analytics + module CMS + knowledge base
- AI tutor with crisis-intent safeguarding message

## Out of scope (later)

Teacher/parent dashboards, Redis, true vector RAG, React Native, offline PWA sync.
