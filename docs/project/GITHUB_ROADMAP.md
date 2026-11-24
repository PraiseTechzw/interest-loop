# InterestLoop — roadmap

## Product

Personalized mobile app for tech enthusiasts: curated news, movie recommendations, web discoveries, a knowledge graph of your interests and mindset coaching — with offline persistence.

## Delivered

**MVP (issues #1–#3, PR #4)**
- Expo project, SDK 58 dependencies, Expo Router, CI and EAS config.
- NewsAPI feed, TMDB recommendations, offline SQLite persistence.
- Discovery (Hacker News + Reddit), knowledge graph, mindset coach, profile, dark mode and accessibility.
- Full documentation and browser QA.

**Phase 3/4 (issues #6–#8, PR pending)**
- Issue #6 — Learning paths from saved content with progress tracking.
- Issue #7 — Time capsule with privacy-controlled reflection sharing.
- Issue #8 — Unit tests, Maestro E2E flow, beta checklist and EAS preview build.

## Recently delivered — personal app focus

- Custom topics: create, colour, tag and delete your own interests.
- Capture a thought: private notes that feed Learning Paths, Search and Time Capsule.
- Backup & restore: full local JSON export/import (no account, no cloud, no community).

## Remaining work (post-beta candidates)

- Run the [beta checklist](../guides/BETA_CHECKLIST.md) on physical devices and triage feedback.
- Add opt-in crash/performance telemetry only if the user wants it — the app is personal-only and has no community, accounts or server sync by design.

## Setup

```bash
npm install
cp .env.example .env   # optional keys: EXPO_PUBLIC_NEWSAPI_KEY, EXPO_PUBLIC_TMDB_KEY
npx expo start
```

See [README.md](../../README.md) for the full guide and [CONTRIBUTING.md](../../CONTRIBUTING.md) for the definition of done.

## Architecture

```
src/app/         routes (Group tabs + pushed stack screens)
src/components/  reusable UI
src/constants/   interest catalogue
src/hooks/       TanStack Query hooks
src/lib/         database, api wrapper, graph, links, formatting
src/services/    news, movies, discovery
src/theme/       design tokens
src/types/       shared models
```

TanStack Query handles caching and refetching; `expo-sqlite` handles persistence; remote adapters return `FeedResult<T>` with `items`, `notice` and optional `error`. Feeds are live-only — no bundled demo content.
