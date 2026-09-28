# JobTrackr

A kanban-style job application tracker. Track applications through each stage, log referral contacts and outreach, and keep notes on interview rounds.

- **Frontend:** React 19, Vite, Tailwind CSS, dnd-kit (drag and drop), React Router
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT auth (access + refresh tokens)
- **Hosting:** Vercel (frontend), Railway (backend + Postgres)

## Features

- Sign up / log in with email and password
- Drag job cards between stages (Wishlist, Applied, Interview, Offer, Rejected)
- Job detail drawer with notes, salary range, deadlines and links
- Contacts per job: who you reached out to, how, and whether they replied
- Interview rounds per job with dates and outcomes

## Project structure

```
backend/     FastAPI app (run from inside this folder)
  main.py        app setup, CORS, rate limiting, /health
  auth.py        password hashing and JWT helpers
  models.py      SQLAlchemy models (users, jobs, contacts, interviews)
  schemas.py     Pydantic request/response schemas
  routes/        /auth and /jobs endpoints
frontend/    React + Vite single-page app
  src/api/       axios client with automatic token refresh
  src/pages/     Login, Signup, Dashboard
  src/components/
```

## Running locally

You need Python 3.12, Node 20+, and a local PostgreSQL database.

**Backend**

```bash
cd backend
python -m venv ../venv && source ../venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in DATABASE_URL and SECRET_KEY
uvicorn main:app --reload
```

The API runs at http://localhost:8000 with interactive docs at http://localhost:8000/docs. Tables are created automatically on startup.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

## Environment variables

| Where | Variable | Purpose |
|---|---|---|
| backend | `DATABASE_URL` | Postgres connection string |
| backend | `SECRET_KEY` | JWT signing key, unique per environment |
| backend | `ALGORITHM` | JWT algorithm (`HS256`) |
| backend | `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime |
| backend | `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime |
| backend | `ALLOWED_ORIGINS` | Comma-separated frontend URLs allowed by CORS |
| frontend | `VITE_API_URL` | Backend URL, read at build time |

## Deployment

**Backend (Railway):** deploy the repo with Root Directory `backend`, add a PostgreSQL database, set the backend variables above (`DATABASE_URL=${{Postgres.DATABASE_URL}}`), generate a domain, and set the health check path to `/health`. The `Procfile` starts uvicorn on Railway's `$PORT`.

**Frontend (Vercel):** import the repo with Root Directory `frontend` (Vite is auto-detected) and set `VITE_API_URL` to the Railway domain. `vercel.json` rewrites all routes to `index.html` so refreshing on `/login` works.

**Connect them:** set `ALLOWED_ORIGINS` on Railway to the Vercel URL.

## Notes

- Login is limited to 10 attempts per minute and signup to 10 per hour, per IP.
- Emails are case-insensitive; passwords must be at least 8 characters.
- Schema changes: `create_all` only creates missing tables. Adding columns to existing tables will need a migration tool such as Alembic.
