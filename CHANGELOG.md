# Changelog

## Unreleased

### Added
- **Live-only feeds** — removed all bundled demo/sample content. News, movies and discovery show honest empty/error states instead of fabricated data; Coach prompts are created by the user.
- **Branded app assets** — infinity-loop identity wired into the app icon, Android adaptive icons, splash screen, favicon and GitHub social preview. Original artwork is preserved in `assets/source/`.
- **Movie thumbnails** — real TMDB posters are shown when a TMDB key is configured; movie cards also include a Watch trailer action.
- **Watch trailer** action on movie cards, opening a YouTube search for the official trailer.
- **FreeNewsApi source** — news headlines are merged from NewsAPI and FreeNewsApi when both keys are configured, with duplicate removal, newest-first ordering and rate-limited detail requests. Works with either key alone; shows a clear empty state with setup guidance when neither is configured.
- Unit tests for the new adapter and source merging (8 new tests, 35 total).

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
