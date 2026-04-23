# hanzi.repeat

A spaced-repetition flashcard app for HSK Chinese vocabulary. Built as a portfolio piece demonstrating React, TypeScript, and modern CSS.

<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 26 PM" src="https://github.com/user-attachments/assets/c7d3d1cb-529f-4596-b5f8-163d6341ca85" />

## Stack

**Frontend**

- **React 18** with **TypeScript** (strict mode)
- **Vite** for development and bundling
- **React Router v6** for client-side routing
- **CSS custom properties** for theming (no CSS-in-JS, no framework)

**Backend**

- **Node.js / Express** with **TypeScript**
- **PostgreSQL** database
- **Drizzle ORM** for schema, migrations, and queries
- **JWT** authentication with bcrypt password hashing
- **Zod** for request validation

## Getting Started

### Frontend

```bash
yarn install
yarn start
```

Runs the app at `http://localhost:5173`.

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `yarn start`   | Start the dev server                 |
| `yarn build`   | Type-check and build for production  |
| `yarn preview` | Preview the production build locally |
| `yarn lint`    | Lint all `.ts` / `.tsx` files        |

### Backend

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, PORT
npm install
npm run db:generate    # generate SQL migrations from schema
npm run db:migrate     # apply migrations to the database
npm run db:seed        # seed HSK vocabulary (10 decks, 30 words)
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

## Screens

| Route    | Screen                                                        |
| -------- | ------------------------------------------------------------- |
| `/`      | Dashboard — streak, due queue, activity heatmap, goals        |
| `/study` | Study mode — flip cards, rate, spaced repetition              |
| `/decks` | Deck browser — all HSK 1 decks with progress                  |
| `/stats` | Stats — accuracy trends, tone breakdown, contribution heatmap |

## Study Mode

Cards cycle through three states without changing routes:

1. **Front** — large hanzi character, click or press `Space` to reveal
2. **Back** — tone-colored pinyin, meaning, audio button; press `1` (wrong) or `2` (right)
3. **Summary** — accuracy, streak, timeline; restart without a page reload

Wrong cards are requeued two positions ahead (simple SRS). A streak of 3+ correct answers triggers a sparkle animation.

## API Reference

All authenticated routes require `Authorization: Bearer <token>`.

| Method | Path                           | Auth | Description                         |
| ------ | ------------------------------ | ---- | ----------------------------------- |
| `GET`  | `/health`                      | —    | Health check                        |
| `POST` | `/api/auth/register`           | —    | Create account                      |
| `POST` | `/api/auth/login`              | —    | Get JWT                             |
| `GET`  | `/api/auth/me`                 | ✓    | Current user                        |
| `GET`  | `/api/words`                   | —    | List words (`?deck=Verbs&q=你`)     |
| `GET`  | `/api/words/:id`               | —    | Single word                         |
| `GET`  | `/api/decks`                   | —    | All decks with word counts          |
| `GET`  | `/api/decks/:id`               | —    | Deck with its words                 |
| `GET`  | `/api/progress`                | ✓    | User's full SRS progress            |
| `GET`  | `/api/progress/due`            | ✓    | Words due for review now            |
| `POST` | `/api/progress/:wordId/review` | ✓    | Record review (`{ correct: bool }`) |

## Project Structure

```
src/                        # Frontend (React + Vite)
├── App.tsx                 # BrowserRouter + Routes
├── context/
│   └── TweaksContext.tsx   # Theme + display preferences
├── components/
│   ├── Layout.tsx          # Shared shell: Topbar + Tabs + Outlet
│   ├── Icon.tsx            # Inline SVG icon set
│   ├── Pinyin.tsx          # Tone-colored pinyin renderer
│   └── Heatmap.tsx         # GitHub-style contribution heatmap
├── screens/
│   ├── Dashboard.tsx
│   ├── StudyScreen.tsx     # Flip card state machine + SRS queue
│   ├── SessionSummary.tsx  # Post-session results
│   ├── DeckBrowser.tsx
│   └── StatsScreen.tsx
├── data/
│   └── index.ts            # Static HSK seed data
├── types/index.ts
└── styles/index.css        # Design tokens (light/dark), component styles

server/                     # Backend (Express + Drizzle + PostgreSQL)
├── src/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema: users, decks, words, user_progress
│   │   ├── index.ts        # postgres client + drizzle instance
│   │   ├── migrate.ts      # Programmatic migration runner
│   │   └── seed.ts         # HSK vocabulary seed
│   ├── middleware/
│   │   └── auth.ts         # JWT signing + requireAuth middleware
│   ├── routes/
│   │   ├── auth.ts         # register / login / me
│   │   ├── words.ts        # list + search words
│   │   ├── decks.ts        # list decks + get deck with words
│   │   └── progress.ts     # SRS progress + SM-2 scheduling
│   └── index.ts            # Express app entry point
├── drizzle.config.ts
└── railway.json            # Railway build + deploy config
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

## Deployment

**Backend → Railway**

1. Create a new Railway project and add a **PostgreSQL** plugin
2. Add a second service pointed at this repo with **Root Directory** set to `server`
3. Set environment variables: `JWT_SECRET`, `ALLOWED_ORIGIN` (frontend URL)
4. `DATABASE_URL` is injected automatically by Railway's PostgreSQL plugin
5. The `railway.json` handles build (`npm run build`), migration, and start automatically

**Frontend → Vercel / Railway**

Set `VITE_API_URL` to the backend Railway URL and update the fetch calls in the frontend.

## More Screenshots

### Desktop

<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 16 PM" src="https://github.com/user-attachments/assets/4a90013e-57aa-4e18-89b3-7b063352b0f8" />
<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 31 PM" src="https://github.com/user-attachments/assets/33c86fc5-4e7e-4789-a538-0f41ec93df8a" />
<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 37 PM" src="https://github.com/user-attachments/assets/d2565f66-cf69-4afc-82b6-ac6fc3376548" />

### Mobile

<img width="24%" alt="Screenshot 2026-04-23 at 7 16 47 PM" src="https://github.com/user-attachments/assets/1ac06a5f-1611-40a9-833b-ec5310647adb" /><img width="24%" alt="Screenshot 2026-04-23 at 7 16 54 PM" src="https://github.com/user-attachments/assets/47a0b766-7b1b-4be3-abbb-c068899d1ca4" /><img width="24%" alt="Screenshot 2026-04-23 at 7 16 58 PM" src="https://github.com/user-attachments/assets/9b493d77-0d50-4938-bf9a-64bf9dd0ae22" /><img width="24%" alt="Screenshot 2026-04-23 at 7 17 03 PM" src="https://github.com/user-attachments/assets/348fe73f-4d7d-477f-a4eb-ea084c286b53" />
