# hanzi.repeat

[Study completely free here](https://hanzirepeat.vercel.app/)

A spaced-repetition flashcard app for HSK Chinese vocabulary. Built as a portfolio piece demonstrating React, TypeScript, and modern CSS.

<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 26 PM" src="https://github.com/user-attachments/assets/c7d3d1cb-529f-4596-b5f8-163d6341ca85" />

## Stack

**Frontend**

- **React 19** with **TypeScript** (strict mode)
- **Vite** for development and bundling
- **React Router v7** for client-side routing
- **CSS custom properties** for theming (no CSS-in-JS, no framework)

**Backend**

- **Node.js / Express 5** with **TypeScript**
- **PostgreSQL** database
- **Drizzle ORM** for schema, migrations, and queries
- **JWT** authentication with bcrypt password hashing
- **Zod** for request validation
- **Anthropic SDK** for AI-generated mnemonics (streamed via SSE)

## Getting Started

### Frontend

```bash
npm install
npm start
```

Runs the app at `http://localhost:5173`.

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm start`          | Start the dev server                 |
| `npm run build`      | Type-check and build for production  |
| `npm run preview`    | Preview the production build locally |
| `npm run lint`       | Lint all `.ts` / `.tsx` files        |
| `npm test`           | Run unit tests once                  |
| `npm run test:watch` | Run unit tests in watch mode         |

### Backend

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET
npm install
npm run db:push        # push schema to database (dev)
npm run db:seed        # seed HSK vocabulary (136 decks, ~3,500 words)
npm run dev            # start dev server with hot-reload (tsx watch)
```

Runs the API at `http://localhost:3001`.

| Command               | Description                                |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Start dev server with hot-reload           |
| `npm run build`       | Compile TypeScript to `dist/`              |
| `npm start`           | Run compiled server (`node dist/index.js`) |
| `npm run db:generate` | Generate migrations from schema changes    |
| `npm run db:migrate`  | Apply pending migrations                   |
| `npm run db:push`     | Push schema directly (dev only)            |
| `npm run db:studio`   | Open Drizzle Studio database browser       |
| `npm run db:seed`     | Seed vocabulary data                       |
| `npm test`            | Run unit tests once                        |
| `npm run test:watch`  | Run unit tests in watch mode               |

### Environment variables (server)

| Variable         | Required | Default                 |
| ---------------- | -------- | ----------------------- |
| `DATABASE_URL`   | Yes      | —                       |
| `JWT_SECRET`     | Yes      | —                       |
| `PORT`           | No       | `3001`                  |
| `ALLOWED_ORIGIN` | No       | `http://localhost:5173` |

| `WHITELISTED_IPS`  | No       | —                       | Comma-separated IPs exempt from the 2-accounts-per-IP registration limit |
| `ANTHROPIC_API_KEY`| No       | —                       | Required to enable AI mnemonic generation (see Feature Flags)            |

**Frontend**

| Variable                 | Required | Default                    |
| ------------------------ | -------- | -------------------------- |
| `VITE_API_URL`           | No       | `http://localhost:3001`    |
| `VITE_FEATURE_MNEMONIC`  | No       | off                        |

## Screens

| Route            | Screen                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| `/`              | Dashboard — greeting, streak, activity heatmap, daily mix, goals         |
| `/study`         | Study setup — configure session count or pick a deck                     |
| `/study/session` | Study mode — flip cards, rate with SM-2 spaced repetition                |
| `/decks`         | Deck browser — all HSK decks with per-deck progress                      |
| `/stats`         | Stats — 30-day KPIs, accuracy trend chart, tone breakdown, top struggles |

## Study Mode

Cards cycle through three states without changing routes:

1. **Front** — large hanzi character, click or press `Space` to reveal
2. **Back** — tone-colored pinyin and meaning; press `1` (wrong) or `2` (right)
3. **Summary** — accuracy, streak, score; restart without a page reload

Wrong cards are requeued two positions ahead. A streak of 3+ correct answers triggers a sparkle animation. Sessions can be loaded with a pre-fetched word list (Daily Mix, deck click), a deck filter, or the default SRS queue of due + new words.

## Feature Flags

Features are gated behind `VITE_FEATURE_*` environment variables. Unset or any value other than `"true"` means off — no errors, just hidden. Toggle by setting the variable in your deployment environment and redeploying.

| Flag                    | Status       | Description                                                                 |
| ----------------------- | ------------ | --------------------------------------------------------------------------- |
| `VITE_FEATURE_MNEMONIC` | Experimental | AI mnemonic button on card back — streams a vivid 2–3 sentence memory story for the character. Requires `ANTHROPIC_API_KEY` on the server. Billed per generation via the Anthropic API (not included in a Claude Pro subscription). |

## API Reference

All authenticated routes require `Authorization: Bearer <token>`.

| Method  | Path                           | Auth | Description                              |
| ------- | ------------------------------ | ---- | ---------------------------------------- |
| `GET`   | `/health`                      | —    | Health check                             |
| `POST`  | `/api/auth/register`           | —    | Create account                           |
| `POST`  | `/api/auth/login`              | —    | Get JWT                                  |
| `GET`   | `/api/auth/me`                 | ✓    | Current user                             |
| `GET`   | `/api/words`                   | —    | List words (`?deck=Verbs&q=你`)          |
| `GET`   | `/api/words/:id`               | —    | Single word                              |
| `GET`   | `/api/decks`                   | —    | All decks with word + learned counts     |
| `GET`   | `/api/decks/:id`               | —    | Deck with its words                      |
| `GET`   | `/api/progress/activity`       | ✓    | Daily review counts for last 53 weeks    |
| `GET`   | `/api/progress/stats`          | ✓    | Dashboard stats (streak, accuracy, time) |
| `GET`   | `/api/progress/stats30`        | ✓    | 30-day KPIs for stats screen             |
| `GET`   | `/api/progress/session`        | ✓    | Due + new words for a study session      |
| `GET`   | `/api/progress/daily-mix`      | ✓    | 20 weak/unseen words                     |
| `GET`   | `/api/progress/accuracy-trend` | ✓    | Daily accuracy % for last 30 days        |
| `GET`   | `/api/progress/tone-accuracy`  | ✓    | Accuracy broken down by tone             |
| `GET`   | `/api/progress/top-struggles`  | ✓    | 10 words with highest 30-day lapse rate  |
| `GET`   | `/api/progress/due`            | ✓    | Words due for review now                 |
| `POST`  | `/api/progress/:wordId/review` | ✓    | Record review (`{ correct: bool }`)      |
| `POST`  | `/api/sessions`                | ✓    | Start a study session                    |
| `PATCH` | `/api/sessions/:id/end`        | ✓    | End a study session                      |
| `POST`  | `/api/ai/mnemonic`             | ✓    | Stream a mnemonic story for a word (SSE) |

## Project Structure

```
src/                          # Frontend (React + Vite)
├── App.tsx                   # BrowserRouter + Routes + RequireAuth guard
├── api/client.ts             # Typed API client (all fetch calls)
├── config/features.ts        # Feature flags (VITE_FEATURE_* env vars)
├── context/
│   ├── AuthContext.tsx        # JWT auth state, persisted to localStorage
│   └── TweaksContext.tsx      # Theme + display preferences (script, toneColor, etc.)
├── components/
│   ├── Layout.tsx             # Shared shell: Topbar + Tabs + Outlet
│   ├── Icon.tsx               # Inline SVG icon set
│   ├── Pinyin.tsx             # Tone-colored pinyin renderer
│   ├── Heatmap.tsx            # GitHub-style activity heatmap
│   └── ProgressBar.tsx        # Generic progress bar
├── screens/
│   ├── Dashboard.tsx          # Main dashboard with stats, heatmap, goals
│   ├── StudySetupScreen.tsx   # Session configuration
│   ├── StudyScreen.tsx        # Flip card state machine + SRS queue
│   ├── SessionSummary.tsx     # Post-session results
│   ├── DeckBrowser.tsx        # HSK deck list with progress
│   ├── StatsScreen.tsx        # 30-day stats, charts, tone breakdown
│   ├── LoginScreen.tsx
│   └── RegisterScreen.tsx
├── utils/
│   └── time.ts                # timeAgo(), greeting()
├── types/index.ts
└── styles/index.css           # Design tokens (light/dark), all component styles

server/                        # Backend (Express + Drizzle + PostgreSQL)
├── src/
│   ├── db/
│   │   ├── schema.ts          # All table definitions and relations
│   │   ├── index.ts           # postgres client + drizzle instance
│   │   ├── migrate.ts         # Programmatic migration runner
│   │   └── seed.ts            # HSK vocabulary seed
│   ├── middleware/
│   │   └── auth.ts            # JWT signing + requireAuth middleware
│   ├── routes/
│   │   ├── auth.ts            # register / login / me
│   │   ├── words.ts           # list + search words
│   │   ├── decks.ts           # list decks + deck detail
│   │   ├── progress.ts        # SRS progress, SM-2 scheduling, all stats
│   │   ├── sessions.ts        # Study session start/end (time tracking)
│   │   └── ai.ts              # AI mnemonic generation (SSE streaming, experimental)
│   ├── utils/
│   │   ├── srs.ts             # SM-2 algorithm (nextReviewSchedule)
│   │   └── shuffle.ts         # Fisher-Yates shuffle
│   └── index.ts               # Express app entry point
├── drizzle.config.ts
└── railway.json               # Railway build + deploy config
```

## Design

The aesthetic targets a dev-portfolio look: monospace labels, thin 1px borders, a warm paper light mode, and a deep ink dark mode. Toggle between them with the button in the top-right corner of the topbar.

Standard pinyin tone colors are used throughout:

| Tone            | Color  |
| --------------- | ------ |
| 1st (high flat) | Red    |
| 2nd (rising)    | Orange |
| 3rd (dipping)   | Green  |
| 4th (falling)   | Blue   |
| Neutral         | Gray   |

## Data Sources

HSK 3.0 vocabulary data (levels 1–5) sourced from [drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary).

## Deployment

**Backend → Railway**

1. Create a new Railway project and add a **PostgreSQL** plugin
2. Add a second service pointed at this repo with **Root Directory** set to `server`
3. Set environment variables: `JWT_SECRET`, `ALLOWED_ORIGIN` (frontend URL)
4. `DATABASE_URL` is injected automatically by Railway's PostgreSQL plugin
5. The `railway.json` handles build (`npm run build`), migration, and start automatically

**Frontend → Vercel / Railway**

Set `VITE_API_URL` to the backend Railway URL.

## More Screenshots

### Desktop

<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 16 PM" src="https://github.com/user-attachments/assets/4a90013e-57aa-4e18-89b3-7b063352b0f8" />
<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 31 PM" src="https://github.com/user-attachments/assets/33c86fc5-4e7e-4789-a538-0f41ec93df8a" />
<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 37 PM" src="https://github.com/user-attachments/assets/d2565f66-cf69-4afc-82b6-ac6fc3376548" />

### Mobile

<img width="24%" alt="Screenshot 2026-04-23 at 7 16 47 PM" src="https://github.com/user-attachments/assets/1ac06a5f-1611-40a9-833b-ec5310647adb" /><img width="24%" alt="Screenshot 2026-04-23 at 7 16 54 PM" src="https://github.com/user-attachments/assets/47a0b766-7b1b-4be3-abbb-c068899d1ca4" /><img width="24%" alt="Screenshot 2026-04-23 at 7 16 58 PM" src="https://github.com/user-attachments/assets/9b493d77-0d50-4938-bf9a-64bf9dd0ae22" /><img width="24%" alt="Screenshot 2026-04-23 at 7 17 03 PM" src="https://github.com/user-attachments/assets/348fe73f-4d7d-477f-a4eb-ea084c286b53" />
