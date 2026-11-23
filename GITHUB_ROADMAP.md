# InterestLoop — roadmap

## Product

Personalized mobile app for tech enthusiasts: curated news, movie recommendations, web discoveries, a knowledge graph of your interests and mindset coaching — with offline persistence.

## Delivered in this release

- Issue #1 — Expo project & base configuration: file-based routing, providers, CI-ready checks, EAS config.
- Issue #2 — Tech news feed: NewsAPI adapter, interest queries, offline saves, fallback data.
- Issue #3 — Movie recommendations: TMDB genre discovery by interest, offline saves, fallback data.
- Issue #4 — Offline reading: SQLite persistence for articles, movies and discoveries.
- Issue #5 — Project structure & documentation: README, contributing guide, screen guide, updated status docs.
- Issue #6 — Discovery feed: Hacker News + Reddit with ranking and source filters.
- Issue #7 — Knowledge graph: interactive SVG graph with pan/zoom and topic details.
- Issue #8 — Mindset coach: prompts, response storage and spaced repetition.
- Issue #11 — Dark mode & accessibility: system color scheme, tokens, labelled controls.

## Remaining milestones

### Phase 3 — Learning
- **#9 Learning paths** — sequence saved articles/movies into guided tracks with progress.

### Phase 4 — Community & release
- **#10 Community time-capsule** — share a dated snapshot of interests and reflections.
- **#12 Beta testing & feedback** — internal distribution, feedback capture, crash/analytics review.

## Setup

```bash
npm install
cp .env.example .env   # optional keys: EXPO_PUBLIC_NEWSAPI_KEY, EXPO_PUBLIC_TMDB_KEY
npx expo start
```

See [README.md](./README.md) for the full guide and [CONTRIBUTING.md](./CONTRIBUTING.md) for the definition of done.

## Architecture

```
src/app/         routes (Group tabs + pushed stack screens)
src/components/  reusable UI
src/constants/   interest catalogue
src/data/        curated fallback content
src/hooks/       TanStack Query hooks
src/lib/         database, api wrapper, graph, links, formatting
src/services/    news, movies, discovery
src/theme/       design tokens
src/types/       shared models
```

TanStack Query handles caching and refetching; `expo-sqlite` handles persistence; remote adapters always return `FeedResult<T>` with an `isDemo`/`notice` pair so screens can show sample content honestly.
