# InterestLoop

[![CI](https://github.com/PraiseTechzw/interest-loop/actions/workflows/ci.yml/badge.svg)](https://github.com/PraiseTechzw/interest-loop/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-58-000020.svg)](https://docs.expo.dev/versions/v58.0.0/)
[![Platforms](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-blue.svg)](#quick-start)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A personalized Expo / React Native app that pulls together tech news, movie picks, hidden gems from the web, a knowledge graph of your interests, and a mindset coach — with offline saving built in.

Built with **Expo SDK 58**, **Expo Router**, **TypeScript**, **TanStack Query** and **expo-sqlite**. Runs on Android, iOS and web.

---

## Quick start

```bash
npm install
cp .env.example .env      # optional: add API keys for live news/movies
npm run env:check   # verify EXPO_PUBLIC_* keys before launching
npx expo start
```

Scan the QR code with Expo Go, press `a` / `i` for an emulator/simulator, or `w` for web.

> `expo-sqlite` needs a development build for some native configurations; it works in Expo Go with the default setup used here. Web requires the COOP/COEP headers configured in `metro.config.js` and `app.json`.

### Optional API keys

| Variable | Source | Without it |
| --- | --- | --- |
| `EXPO_PUBLIC_NEWSAPI_KEY` | https://newsapi.org/ | No news is shown until a key is set |
| `EXPO_PUBLIC_FREENEWS_KEY` | https://freenewsapi.io/ | That source is skipped; other live sources still work |
| `EXPO_PUBLIC_TMDB_KEY` | https://www.themoviedb.org/settings/api | No movies are shown until a key is set |

News headlines are merged from NewsAPI and FreeNewsApi when both keys are set. FreeNewsApi's free tier allows 5,000 requests/day at 2 requests/second; the adapter paces its calls to stay within that limit and fetches article details (link, image, summary) for the top stories.

Discovery uses the public Hacker News and Reddit JSON APIs — no key required. If those requests fail, the screen shows an error with a retry action. No bundled sample content is included.

Restart the dev server after changing `.env`.

---

## Features

- **Home** — your interests at a glance, top stories, movie picks and a hidden gem, with quick links to Coach, Graph and Saved.
- **News** — interest-filtered live stories, saved offline, pull-to-refresh, connection status in Profile.
- **Movies** — TMDB genre recommendations mapped from your interests, save for later, pull-to-refresh.
- **Discover** — Hacker News + Reddit stories ranked by score/recency, source filters, save finds.
- **Profile** — toggle interests; saved counts; data-source status. Interest changes update the news, movie and graph data immediately.
- **My topics** — create your own interests with a name, colour, icon and news keywords. Custom topics work across feeds, graph, learning paths, capsules and notes.
- **Knowledge Graph** — SVG graph of your interests with pan, zoom, node details and relationships derived from saved activity.
- **Mindset Coach** — first-principles, inversion, second-order and Occam prompts; saved reflections with simplified spaced repetition (Again / Got it).
- **Capture a thought** — private notes for ideas, links and things you want to remember. Tag them to a topic; they become Learning Path steps and show up in Search.
- **Learning Paths** — guided routes built from your saved content and your own notes, with per-step progress.
- **Time Capsule** — a dated, shareable snapshot of your interests and progress, including your own notes. Reflection text is opt-in and off by default.
- **Saved** — all offline articles, movies, finds and your own notes in one place with editing and removal.
- **Settings** — live-source connection status, app version, privacy summary and one-tap local data clearing.
- **Onboarding** — first-run interest picker (minimum two topics).
- **Article reader / movie detail** — offline reading for saved summaries, movie synopsis with trailer link.
- **Backup & restore** — copy all local data to JSON and restore it from the clipboard later. Older backups still import.
- **Search, feedback, diagnostics, accessibility and terms** screens. Search covers saved articles, movies, finds and your own notes.
- **Credits / Privacy** — data-source attributions and a plain-language privacy summary.
- Dark mode follows the system. Interactive controls have accessibility labels and 38–44px touch targets.

### Interests

Built in: CIA, MI6, Geek Culture, Romance, 3D & Animation, Animation Craft, Learning, Problem Solving. Four are selected by default. You can add unlimited topics of your own from **Profile → My topics** — this is a personal app, so there is no community, account or cloud sync.

---

## Project structure

```
src/
├── app/                    # Expo Router screens (file-based routes)
│   ├── (tabs)/             # Home, News, Movies, Discover, Profile
│   ├── coach.tsx           # Pushed stack screen
│   ├── graph.tsx           # Pushed stack screen
│   ├── saved.tsx           # Pushed stack screen
│   ├── learning.tsx        # Learning paths
│   ├── capsule.tsx         # Dated time capsule
│   ├── capture.tsx         # Personal notes
│   ├── interests.tsx       # Create and manage your own topics
│   ├── export.tsx          # Backup & restore
│   └── _layout.tsx         # Providers, SQLite, Stack
├── components/             # Reusable UI and content cards
├── constants/              # Built-in interests and custom-interest factories
├── hooks/                  # TanStack Query hooks
├── lib/                    # Database, API, graph, interest registry, formatting, links
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
| `npm run env:check` | Preflight check for `EXPO_PUBLIC_*` keys (values are never printed) |
| `npm test` | Jest unit tests (54 tests) |
| `npm run test:watch` | Jest in watch mode |

Checks run in CI on every PR: dependency validation, Expo Doctor, typecheck, lint, unit tests and web export. Browser smoke tests are run manually for UI changes.

---

## Data & offline behaviour

`src/lib/database.ts` owns the SQLite schema (version 8, versioned with `PRAGMA user_version`) and all parameterized queries. Tables: `user_interests`, `custom_interests`, `user_profile`, `saved_articles`, `saved_movies`, `saved_discovery`, `saved_notes`, `coach_responses`, `mindset_prompts`, `learning_progress`, `capsules`, `feedback`.

Everything is local. **Backup & restore** exports all of it as JSON. Custom topics and notes are included; API keys never are.

All remote feeds require live sources. When a key is missing or a request fails, screens show a clear empty or error state with setup guidance and a retry action — no fabricated content is bundled.

---

## Builds

`eas.json` defines `development`, `preview` and `production` profiles.

```bash
bunx eas-cli build --profile preview --platform android
bunx eas-cli build --profile production --platform all
bunx eas-cli submit
```

## Repository guide

| Document | Purpose |
| --- | --- |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to propose and implement changes |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community standards |
| [SECURITY.md](./SECURITY.md) | Private vulnerability reporting and supported versions |
| [SUPPORT.md](./SUPPORT.md) | Where to get help |
| [GOVERNANCE.md](./GOVERNANCE.md) | Roles and decision making |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| [docs/README.md](./docs/README.md) | Index of all project documentation |
| [docs/PRIVACY.md](./docs/PRIVACY.md) | Privacy policy ready to publish for store listings |
| [docs/TERMS.md](./docs/TERMS.md) | Terms of use |
| [docs/guides/BETA_CHECKLIST.md](./docs/guides/BETA_CHECKLIST.md) | Release testing and distribution |
| [docs/guides/SCREEN_USAGE.md](./docs/guides/SCREEN_USAGE.md) | Feature walkthrough |
| [docs/guides/ASSET_SPECS.md](./docs/guides/ASSET_SPECS.md) | Brand asset sizes, safe zones and prompts |
| [docs/project/GITHUB_ROADMAP.md](./docs/project/GITHUB_ROADMAP.md) | Delivered and planned work |
| [docs/reports/FINAL_REPORT.md](./docs/reports/FINAL_REPORT.md) | Delivery and team contribution report |

Bug reports and feature requests use the templates in [`.github/ISSUE_TEMPLATE`](./.github/ISSUE_TEMPLATE). Pull requests use [the PR template](./.github/PULL_REQUEST_TEMPLATE.md). All changes must pass the CI checks listed in CONTRIBUTING.

MIT licensed. See [LICENSE](./LICENSE).
