# InterestLoop

A personalized Expo / React Native app that pulls together tech news, movie picks, hidden gems from the web, a knowledge graph of your interests, and a mindset coach — with offline saving built in.

Built with **Expo SDK 58**, **Expo Router**, **TypeScript**, **TanStack Query** and **expo-sqlite**. Runs on Android, iOS and web.

---

## Quick start

```bash
npm install
cp .env.example .env      # optional: add API keys for live news/movies
npx expo start
```

Scan the QR code with Expo Go, press `a` / `i` for an emulator/simulator, or `w` for web.

> `expo-sqlite` needs a development build for some native configurations; it works in Expo Go with the default setup used here. Web requires the COOP/COEP headers configured in `metro.config.js` and `app.json`.

### Optional API keys

| Variable | Source | Without it |
| --- | --- | --- |
| `EXPO_PUBLIC_NEWSAPI_KEY` | https://newsapi.org/ | Curated sample news is shown |
| `EXPO_PUBLIC_TMDB_KEY` | https://www.themoviedb.org/settings/api | Curated sample movies are shown |

Discovery uses the public Hacker News and Reddit JSON APIs — no key required. If those requests fail, curated finds are shown. The UI always labels sample data with a banner.

Restart the dev server after changing `.env`.

---

## Features

- **Home** — your interests at a glance, top stories, movie picks and a hidden gem, with quick links to Coach, Graph and Saved.
- **News** — interest-filtered stories, saved offline, pull-to-refresh, demo/live indicator.
- **Movies** — TMDB genre recommendations mapped from your interests, save for later, pull-to-refresh.
- **Discover** — Hacker News + Reddit stories ranked by score/recency, source filters, save finds.
- **Profile** — toggle all 8 interest tags; saved counts; data-source status. Interest changes update the news, movie and graph data immediately.
- **Knowledge Graph** — SVG graph of your interests with pan, zoom, node details and relationships derived from saved activity.
- **Mindset Coach** — first-principles, inversion, second-order and Occam prompts; saved reflections with simplified spaced repetition (Again / Got it).
- **Saved** — all offline articles, movies and finds in one place with removal controls.
- Dark mode follows the system. Interactive controls have accessibility labels and 38–44px touch targets.

### Interests

CIA, MI6, Geek Culture, Romance, 3D & Animation, Animation Craft, Learning, Problem Solving. Four are selected by default.

---

## Project structure

```
src/
├── app/                    # Expo Router screens (file-based routes)
│   ├── (tabs)/             # Home, News, Movies, Discover, Profile
│   ├── coach.tsx           # Pushed stack screen
│   ├── graph.tsx           # Pushed stack screen
│   ├── saved.tsx           # Pushed stack screen
│   └── _layout.tsx         # Providers, SQLite, Stack
├── components/             # Reusable UI and content cards
├── constants/              # Interest catalogue and relationships
├── data/                   # Curated offline/demo content
├── hooks/                  # TanStack Query hooks
├── lib/                    # Database, API, graph, formatting, links
├── services/               # News, TMDB, Discovery adapters
├── theme/                  # Light/dark design tokens
└── types/                  # Shared models
```

Routes live in `src/app/` (supported by Expo Router SDK 55+). Non-route code stays outside that directory.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start Expo dev server |
| `npm run android` / `npm run ios` / `npm run web` | Platform-specific dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `expo lint` (ESLint flat config) |
| `npm run export:web` | Production web bundle into `dist/` |

Checks run in CI-equivalent form before every merge: `npx expo install --check`, `npx expo-doctor`, typecheck, lint, web export and browser smoke test.

---

## Data & offline behaviour

`src/lib/database.ts` owns the SQLite schema (versioned with `PRAGMA user_version`) and all parameterized queries. Tables: `user_interests`, `saved_articles`, `saved_movies`, `saved_discovery`, `coach_responses`.

All remote feeds degrade to bundled curated data when offline or unconfigured, so every screen always has a useful four-state experience: loading, error, empty, content.

---

## Builds

`eas.json` defines `development`, `preview` and `production` profiles.

```bash
bunx eas-cli build --profile preview --platform android
bunx eas-cli build --profile production --platform all
bunx eas-cli submit
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [SCREEN_USAGE.md](./SCREEN_USAGE.md) for more.

MIT licensed.
