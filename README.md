# Chinese Flashcards

A spaced-repetition flashcard app for HSK 1 Chinese vocabulary. Built as a portfolio piece demonstrating React, TypeScript, and modern CSS.

<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 26 PM" src="https://github.com/user-attachments/assets/c7d3d1cb-529f-4596-b5f8-163d6341ca85" />
<img width="428" height="936" alt="Screenshot 2026-04-23 at 7 16 54 PM" src="https://github.com/user-attachments/assets/9a845165-e049-4083-b35a-46bcc06fef1b" />


## Stack

- **React 18** with **TypeScript** (strict mode)
- **Vite** for development and bundling
- **React Router v6** for client-side routing
- **CSS custom properties** for theming (no CSS-in-JS, no framework)
- **ESLint** with the Airbnb style guide

## Getting Started

```bash
yarn install
yarn start
```

Runs the app at `http://localhost:5173`.

| Command | Description |
|---|---|
| `yarn start` | Start the dev server |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview the production build locally |
| `yarn lint` | Lint all `.ts` / `.tsx` files |

## Screens

| Route | Screen |
|---|---|
| `/` | Dashboard — streak, due queue, activity heatmap, goals |
| `/study` | Study mode — flip cards, rate, spaced repetition |
| `/decks` | Deck browser — all HSK 1 decks with progress |
| `/stats` | Stats — accuracy trends, tone breakdown, contribution heatmap |

## Study Mode

Cards cycle through three states without changing routes:

1. **Front** — large hanzi character, click or press `Space` to reveal
2. **Back** — tone-colored pinyin, meaning, audio button; press `1` (wrong) or `2` (right)
3. **Summary** — accuracy, streak, timeline; restart without a page reload

Wrong cards are requeued two positions ahead (simple SRS). A streak of 3+ correct answers triggers a sparkle animation.

## Project Structure

```
src/
├── App.tsx                 # BrowserRouter + Routes
├── index.tsx               # React root mount
├── context/
│   └── TweaksContext.tsx   # Theme + display preferences (React Context)
├── components/
│   ├── Layout.tsx          # Shared shell: Topbar + Tabs + Outlet
│   ├── Topbar.tsx
│   ├── Tabs.tsx            # NavLink-based tab navigation
│   ├── Icon.tsx            # Inline SVG icon set
│   ├── Pinyin.tsx          # Tone-colored pinyin renderer
│   ├── Heatmap.tsx         # GitHub-style contribution heatmap
│   ├── ProgressBar.tsx
│   └── TweaksPanel.tsx     # Display preference toggles
├── screens/
│   ├── Dashboard.tsx
│   ├── StudyScreen.tsx     # Flip card state machine
│   ├── SessionSummary.tsx  # Post-session results
│   ├── DeckBrowser.tsx
│   └── StatsScreen.tsx
├── data/
│   └── index.ts            # HSK 1 vocabulary, deck metadata, heatmap seed
├── types/
│   └── index.ts            # FlashCard, DeckSummary, Tweaks, SessionCard
└── styles/
    └── index.css           # Design tokens (light/dark), component styles
```

## Design

The aesthetic targets a dev-portfolio look: monospace labels, thin 1px borders, a warm paper light mode, and a deep ink dark mode. Toggle between them with the button in the top-right corner of the topbar.

Standard pinyin tone colors are used throughout:

| Tone | Color |
|---|---|
| 1st (high flat) | Red |
| 2nd (rising) | Orange |
| 3rd (dipping) | Green |
| 4th (falling) | Blue |
| Neutral | Gray |

## Roadmap

The current data layer is static. The planned backend will add:

- PostgreSQL — user accounts, deck ownership, review history
- Node / Express / TypeScript API — SRS scheduling (SM-2 algorithm), deck CRUD
- Deployment — Vercel (frontend) + Railway (API + database)

## More Screenshots

<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 16 PM" src="https://github.com/user-attachments/assets/4a90013e-57aa-4e18-89b3-7b063352b0f8" />
<img width="428" height="936" alt="Screenshot 2026-04-23 at 7 16 47 PM" src="https://github.com/user-attachments/assets/1ac06a5f-1611-40a9-833b-ec5310647adb" />
<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 31 PM" src="https://github.com/user-attachments/assets/33c86fc5-4e7e-4789-a538-0f41ec93df8a" />
<img width="428" height="936" alt="Screenshot 2026-04-23 at 7 16 58 PM" src="https://github.com/user-attachments/assets/9b493d77-0d50-4938-bf9a-64bf9dd0ae22" />
<img width="2295" height="1030" alt="Screenshot 2026-04-23 at 2 01 37 PM" src="https://github.com/user-attachments/assets/d2565f66-cf69-4afc-82b6-ac6fc3376548" />
<img width="428" height="936" alt="Screenshot 2026-04-23 at 7 17 03 PM" src="https://github.com/user-attachments/assets/348fe73f-4d7d-477f-a4eb-ea084c286b53" />


