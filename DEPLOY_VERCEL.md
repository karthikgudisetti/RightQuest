# Deploy RightsQuest India to Vercel

This app has a **Vite frontend** + **Express API** + **database**.

- Local: SQLite (`backend/prisma/schema.prisma`)
- Vercel: PostgreSQL (`backend/prisma/schema.postgres.prisma`) — e.g. free [Neon](https://neon.tech)

## 1) Create a free Postgres database (Neon)

1. Go to https://neon.tech → create a project
2. Copy the connection string (`postgresql://...`)

## 2) Seed production database (once)

On your machine (with the Neon URL):

```bash
cd backend
$env:DATABASE_URL="postgresql://YOUR_NEON_URL"
npx prisma generate --schema=prisma/schema.postgres.prisma
npx prisma db push --schema=prisma/schema.postgres.prisma
npx tsx prisma/seed.ts
# restore local SQLite client
npx prisma generate
```

(On Mac/Linux use `export DATABASE_URL=...` instead of `$env:`.)

Demo logins after seed:

- Child: `child@demo.com` / `demo1234`
- Admin: `admin@demo.com` / `demo1234`

## 3) Deploy on Vercel (GitHub)

1. Open https://vercel.com/new
2. Import `karthikgudisetti/RightQuest`
3. **Root Directory**: leave as repository root (do not set to `frontend`)
4. Framework: Other / leave blank (uses `vercel.json`)
5. Add **Environment Variables**:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon Postgres URL |
| `JWT_SECRET` | long random string |
| `JWT_REFRESH_SECRET` | long random string |
| `OPENAI_API_KEY` | optional |
| `CORS_ORIGIN` | optional custom domain `https://yourdomain.com` |

6. Deploy

Your site will be at `https://<project>.vercel.app`

API paths: `https://<project>.vercel.app/api/v1/...`  
Frontend uses `/api/v1` by default (same origin) — no `VITE_API_URL` needed.

## 4) CLI deploy (optional)

```bash
npx vercel login
npx vercel
npx vercel --prod
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails: DATABASE_URL | Add env var in Vercel project settings |
| Login fails after deploy | Re-run seed against Neon |
| CORS errors on custom domain | Set `CORS_ORIGIN=https://your-domain.com` |
| AI tutor generic answers | Set `OPENAI_API_KEY` in Vercel |

## Local development (unchanged)

```bash
npm run setup
npm run dev
```

Uses SQLite file DB — separate from Neon.
