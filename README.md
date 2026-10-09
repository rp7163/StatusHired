# StatusHired (MERN)

A job application tracker for managing your whole search in one place: applications, kanban pipeline, resumes, reminders and stats. Sign-up is protected by an email OTP so only people who own the email address can create an account.

**Stack:** MongoDB · Express.js · React 19 (JavaScript / JSX) · Node.js · Vite · Tailwind CSS v4 · Socket.io · JWT · Multer · Nodemailer / Resend

> This is a full MERN port of the original TypeScript + Supabase project. Same UI, same features — Supabase Auth → JWT, Postgres → MongoDB/Mongoose, Supabase Storage → Multer + signed links, Supabase Realtime → Socket.io, RLS → per-user query scoping.

## Features

- **Dashboard** with charts and stats on your pipeline
- **Applications list** with search, filters and a detail drawer (with stage timeline)
- **Kanban board** with drag-and-drop between stages (`saved`, `applied`, `assessment`, `interview`, `selected`, `rejected`) and automatic stage history
- **Resume manager** to upload PDFs (max 5 MB), preview, download, rename and delete, and attach them to applications — files are stored in MongoDB (GridFS) so they persist across deployments
- **Reminders** for interviews, take-homes and follow-ups, with optional browser notifications
- **Realtime sync** across tabs/devices via Socket.io
- **Command palette** and keyboard shortcuts
- **Light / dark / system theme** (persisted per user)
- **Optional device biometrics** (WebAuthn) after sign-up
- **Per-user data isolation** — every API query is scoped to the authenticated JWT user
- **Profile page** (`/profile`) — portfolio-style hero with your photo, headline, bio, location, portfolio / resume buttons, social & coding-profile links, extra custom links and live stats; everything editable in-app
- **Profile photo upload** (JPG/PNG/WEBP/GIF ≤ 2 MB) with a default illustrated avatar when no photo and no name/username are set
- **About page** (`/about`) — your portfolio content (hero, stats, about, skills, projects, education, achievements, coding profiles, contact) driven by a single editable file: `client/src/data/about.js`
- **Top header navigation** (pill menu, search ⌘K, notifications, theme toggle, **+ create menu** for application / resume / reminder, account menu) and a portfolio-style footer showing your social links
- **Emerald/teal theme** matching [patelrudra.vercel.app](https://patelrudra.vercel.app) in light and dark mode
- **Automated test-suite** — `npm test` hits every API endpoint and visits every page in a real browser (see [Testing](#testing))

## Sign-up security (OTP)

New accounts are verified on the server, not in the browser:

1. The user enters email and password. The server emails a 6-digit code.
2. The user enters the code. The server checks it.
3. Only then does the server create the MongoDB user (password hashed with bcrypt) and return a JWT.

Details:

- Codes are stored hashed, expire after 10 minutes, and are burned after 5 wrong attempts.
- Resend cooldown of 30 s, at most 5 emails per address per hour, plus per-IP rate limiting.
- Pending sign-ups are kept in server memory, so a server restart cancels them.
- If no email provider is configured in development, the code is **printed in the server terminal** (set `EXPOSE_DEV_OTP=true` to also return it in the API response for automated tests — never in production).

## Project structure

```
statushired-mern/
├── package.json             Root scripts (runs client + server together, tests)
├── tests/                   api.test.mjs (every endpoint) + e2e.mjs (Playwright, every page)
├── client/                  React app (Vite + JSX + Tailwind)
│   └── src/
│       ├── pages/           Dashboard, Applications, Board, Resumes, Reminders, Profile, About, Login
│       ├── data/about.js    ← edit this file to change the About page content
│       ├── components/      UI (Avatar, Button, PageHeader…), layout (Header, Footer, MobileNav), profile, kanban, resumes, modals
│       ├── context/         Auth, Theme, JobTracker, Reminder, Search
│       ├── hooks/           useApplications, useResumes, ...
│       └── lib/             api.js (REST client), realtime.js (Socket.io), signupApi.js, storage.js, biometrics.js
└── server/                  Express API
    └── src/
        ├── index.js         App bootstrap, CORS, routes, static serving in production
        ├── config/db.js     Mongoose connection (+ optional in-memory MongoDB)
        ├── models/          User, UserSettings, Application, Resume, Reminder, StageHistory
        ├── routes/          auth (+ profile & avatar), users (public avatar), applications, resumes, reminders, settings, stageHistory
        ├── middleware/      JWT auth, error handler
        ├── utils/           mailer (Gmail/Resend), otpStore, realtime (Socket.io), fileStore (GridFS / disk)
        └── seed.js          Demo account + sample data
```

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB — **one of**:
  - a local MongoDB (`mongodb://127.0.0.1:27017`), or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or
  - nothing at all: set `USE_MEMORY_DB=true` and the server runs an in-memory MongoDB (data resets on restart)
- Optional: a Gmail account **or** a [Resend](https://resend.com) account for sending OTP emails

### 1. Install

```bash
git clone <your-repo-url> statushired-mern
cd statushired-mern
npm run install:all          # installs root, server and client dependencies
```

### 2. Configure the server

```bash
cp server/.env.example server/.env      # Windows CMD: copy server\.env.example server\.env
```

Fill in `server/.env`:

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS, e.g. `http://localhost:3000` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/statushired` or your Atlas URI |
| `USE_MEMORY_DB` | `true` to skip installing Mongo (demo mode) |
| `JWT_SECRET` | Any long random string — **change it** |
| `JWT_EXPIRES_IN` | Token lifetime (default `30d`) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Gmail SMTP for OTP emails (Google Account → Security → 2-Step Verification → App passwords) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Alternative to Gmail |
| `UPLOAD_DIR` | Folder for resume PDFs (default `uploads`) |
| `SEED_DEMO` | `true` to create `demo@statushired.app / demo1234` with sample data on boot |

Email sending:

- If `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set, Gmail SMTP is used (about 500 emails/day, free).
- Otherwise Resend is used. Without a verified domain, Resend only delivers to your own account email.
- If neither is set in development, the code is printed in the **server terminal** so you can still test.

### 3. Run (development)

```bash
npm run dev
```

This starts the API on **http://localhost:5000** and the React app on **http://localhost:3000** (Vite proxies `/api` and `/socket.io` to the API, so there are no CORS issues).

Or run them separately:

```bash
cd server && npm run dev     # API
cd client && npm run dev     # React
```

### 4. Demo data (optional)

```bash
npm run seed                 # creates demo@statushired.app / demo1234 with sample applications & reminders
```

(or set `SEED_DEMO=true` in `server/.env`).

### 5. Production build

```bash
npm run build                # builds client/dist
npm start                    # Express serves the API *and* the built React app on PORT
```

Set `NODE_ENV=production`, a real `MONGODB_URI`, a strong `JWT_SECRET`, and an email provider.

## API overview

All routes except health and sign-up/login require `Authorization: Bearer <jwt>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server + DB status (used by the UI's status indicator) |
| POST | `/api/auth/signup/request` · `/resend` · `/verify` | OTP sign-up (verify returns a JWT) |
| POST | `/api/auth/login` | Email + password → JWT |
| GET / PATCH / DELETE | `/api/auth/me` | Current user / update profile / delete account + all data |
| POST / DELETE | `/api/auth/me/avatar` | Upload (multipart `avatar`, ≤ 2 MB image) / remove profile photo |
| GET | `/api/users/:id/avatar` | Public: streams the profile photo (404 when none) → used by `user.avatar_url` |
| GET / PUT | `/api/settings` | Theme & notification preferences |
| GET / POST | `/api/applications` | List (resume joined) / create (+ initial stage history) |
| PATCH / DELETE | `/api/applications/:id` | Update (records stage history on stage change) / delete (cascades reminders + history) |
| PATCH | `/api/applications/:id/stage` | Move stage (kanban) |
| PUT | `/api/applications/reorder` | Persist card positions |
| GET | `/api/stage-history?application_id=` | Stage timeline |
| GET / POST | `/api/resumes` | List / upload PDF (multipart `file`, optional `name`) |
| PATCH / DELETE | `/api/resumes/:id` | Rename / delete (file removed, applications unlinked) |
| GET | `/api/resumes/:id/url?expires=60&download=1` | Short-lived signed link (like Supabase `createSignedUrl`) |
| GET | `/api/resumes/:id/file?token=` | Streams the PDF from GridFS (token-protected) |
| GET / POST | `/api/reminders` | List (application joined) / create |
| PATCH / DELETE | `/api/reminders/:id` | Update (done, snooze, notified…) / delete |
| PATCH | `/api/reminders/bulk` | Mark many done |

**Profile fields** accepted by `PATCH /api/auth/me` (all optional): `full_name`, `username` (`a-z A-Z 0-9 _ . -`, ≤ 30), `headline`, `bio` (≤ 600), `location`, `phone`, `open_to_work` (bool), `portfolio_url`, `resume_url`, `github_url`, `linkedin_url`, `twitter_url`, `leetcode_url`, `codeforces_url`, `codechef_url` (URLs are normalised with `https://`), and `links: [{ label, url }]` for anything else. The user JSON also exposes `avatar_url` (null when no photo).

Realtime: the server emits `change { table, event }` over Socket.io to the room `user:<id>` after every mutation; the React hooks refetch the affected collection.

## Testing

The fastest way to check the **whole** app — every endpoint and every URL — is the built-in suite:

```bash
# one-time: browser for the e2e test
npm run test:install          # = npx playwright install chromium

# with the app running (npm run dev in another terminal):
npm run test:api              # ~5 s  – 50 checks against every REST endpoint
npm run test:e2e              # ~45 s – real browser: every page, light + dark, zero console errors
npm test                      # both
```

| Script | What it does | Env |
| --- | --- | --- |
| `test:api` (`tests/api.test.mjs`) | Health → OTP sign-up → login → profile + avatar → settings → applications (create/update/stage/reorder/history) → reminders (incl. bulk) → resumes (upload, signed URL, download, token check) → cleanup → delete account. Asserts status codes and payloads, exits 1 on failure. | `API_URL` (default `http://localhost:5000`). Needs `EXPOSE_DEV_OTP=true` in `server/.env` so the OTP is returned in dev (falls back to the demo account otherwise). |
| `test:e2e` (`tests/e2e.mjs`) | Logs in, checks the anonymous redirect, visits `/`, `/applications`, `/board`, `/resumes`, `/reminders`, `/profile`, `/about` and a 404 URL in light **and** dark mode, opens ⌘K, notifications, account menu, settings, edits the profile, creates an application with the `N` shortcut, checks the mobile menu, signs out. Fails on any console error / uncaught exception / 5xx. Screenshots → `tests/screenshots/`. | `WEB_URL` (default `http://localhost:3000`; use `http://localhost:5000` for the production build), `E2E_EMAIL`, `E2E_PASSWORD` (default demo account). |

Manual quick checks: `curl http://localhost:5000/api/health`, then log in with the demo account and press `?` in the app for the shortcut list (`G` then `P` opens your profile).

## Deploy (GitHub → Vercel + Render + Atlas)

The React app is a static Vite build → **Vercel**. The Express API needs a long-running Node process
(Socket.io websockets, multer file uploads, in-memory OTP store) → **Render** (free tier) — Vercel's
serverless functions can't host it as-is. Database → **MongoDB Atlas**.

1. **Push to GitHub** – `git init && git add . && git commit -m "Job Arena" && git branch -M main`, create an empty repo on github.com, then `git remote add origin <url> && git push -u origin main`. `.env`, `node_modules`, `dist` and `server/uploads` are git-ignored.
2. **API on Render** – New → *Blueprint* → pick the repo (uses `render.yaml`) **or** New → *Web Service* with Root Directory `server`, Build `npm install`, Start `npm start`, Health check `/api/health`. Env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `USE_MEMORY_DB=false`, `CLIENT_ORIGIN=https://<your-app>.vercel.app,https://*.vercel.app`, optional `GMAIL_USER`/`GMAIL_APP_PASSWORD` (otherwise sign-up OTPs only appear in Render logs). Atlas → Network Access → allow `0.0.0.0/0` (Render IPs change).
3. **App on Vercel** – Add New Project → import the repo → **Root Directory: `client`** (framework auto-detects Vite; `client/vercel.json` adds the SPA rewrite) → Environment Variable `VITE_API_URL=https://<your-api>.onrender.com` → Deploy.
4. Put the final Vercel URL into Render's `CLIENT_ORIGIN` (if you didn't already) and redeploy the API.

Notes: Render's free instance sleeps after 15 min idle (first request takes ~30 s). **All data is permanent**: applications, reminders, settings and profiles live in Atlas, and uploaded resumes / profile photos are stored *inside* MongoDB too (GridFS, `FILE_STORAGE=gridfs`, the default) — so nothing is lost when the server redeploys or restarts. Set `FILE_STORAGE=disk` only if you run on a machine with a persistent disk and prefer plain files. Alternative single-host option: deploy the whole repo to Render/Railway with build `npm run install:all && npm run build` and start `npm start` — Express serves `client/dist` itself, no `VITE_API_URL` needed.

## Mapping from the Supabase version

| Supabase | MERN equivalent |
| --- | --- |
| `auth.users` + `signInWithPassword` | `users` collection, bcrypt, JWT (`/api/auth/*`) |
| `admin.createUser` after OTP | `User.create` after OTP in `/api/auth/signup/verify` |
| Tables `applications`, `resumes`, `reminders`, `stage_history`, `user_settings` | Mongoose models with the same snake_case fields; `id` instead of `_id` in JSON |
| `select('*, resumes(*)')` joins | `.populate()` + serializers that add `resumes` / `applications` |
| Postgres trigger writing `stage_history` | Done in the applications routes |
| `on delete cascade` / `set null` | Done explicitly in delete routes |
| Row Level Security | `requireAuth` middleware + `user_id: req.userId` on every query |
| Storage bucket `resumes` + signed URLs | Multer to `server/uploads/<userId>/` + JWT-signed file links |
| Realtime `postgres_changes` | Socket.io `change` events |
| `rpc('delete_user')` | `DELETE /api/auth/me` |
