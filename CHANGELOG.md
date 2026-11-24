# Changelog

## 1.2.0 — Live-only release (24 Nov 2026)

### Changed
- **Live-only feeds** — removed all bundled demo/sample content. News, movies and discovery show honest empty/error states instead of fabricated data; Coach prompts are created by the user and Learning Paths are built only from saved items.
- **API keys** — uploaded to EAS for development, preview and production; new builds include `EXPO_PUBLIC_NEWSAPI_KEY`, `EXPO_PUBLIC_FREENEWS_KEY` and `EXPO_PUBLIC_TMDB_KEY`. Local `.env` changes require `npx expo start -c`.

### Added
- **Branded app assets** — infinity-loop identity wired into the app icon, Android adaptive icons, splash screen, favicon and GitHub social preview. Original artwork is preserved in `assets/source/`.
- **Movie artwork** — real TMDB posters when a key is configured, plus a **Watch trailer** action that opens a YouTube search for the official trailer.
- **FreeNewsApi source** — headlines merged with NewsAPI, deduplicated and sorted newest-first, with rate-limited detail requests.
- **Unit tests** — 35 tests total, including the new adapters and live-only behaviour.

## 1.1.0 — Phase 3/4 (23 Nov 2026)

### Added
- **Learning Paths** — guided routes built from saved articles, movies and discoveries, with per-step progress stored in SQLite.
- **Time Capsule** — dated, shareable snapshot of interests, saved counts and top topics. Reflection text is opt-in and off by default.
- **Unit tests** — Jest + `jest-expo` suite covering graph layout, date formatting and discovery ranking (27 tests).
- **Maestro E2E flow** — `.maestro/save-journey.yml` covers the save-to-offline journey.
- **Beta checklist** and EAS preview profile documentation.

### Changed
- CI now runs unit tests in addition to dependency checks, Expo Doctor, typecheck, lint and web export.
- EAS profiles are simple; live feeds require API keys configured as EAS environment variables.

## 1.0.0 — MVP (23 Nov 2026)

- First working release: Expo Router navigation, news, movies, discovery, graph, coach, profile, offline SQLite storage, documentation and PR workflow.
