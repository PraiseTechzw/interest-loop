# Changelog

## Unreleased

### Added
- **FreeNewsApi source** — news headlines are merged from NewsAPI and FreeNewsApi when both keys are configured, with duplicate removal, newest-first ordering and rate-limited detail requests. Works with either key alone; falls back to curated samples when neither is configured.
- Unit tests for the new adapter and source merging (8 new tests, 35 total).

## 1.1.0 — Phase 3/4 (23 Nov 2026)

### Added
- **Learning Paths** — guided routes built from saved articles, movies and discoveries, with per-step progress stored in SQLite and sample paths for new users.
- **Time Capsule** — dated, shareable snapshot of interests, saved counts and top topics. Reflection text is opt-in and off by default.
- **Unit tests** — Jest + `jest-expo` suite covering graph layout, date formatting and discovery ranking (27 tests).
- **Maestro E2E flow** — `.maestro/save-journey.yml` covers the save-to-offline journey.
- **Beta checklist** and EAS preview profile documentation.

### Changed
- CI now runs unit tests in addition to dependency checks, Expo Doctor, typecheck, lint and web export.
- EAS profiles no longer require API secrets, so preview builds work in demo mode out of the box.

## 1.0.0 — MVP (23 Nov 2026)

- First working release: Expo Router navigation, news, movies, discovery, graph, coach, profile, offline SQLite storage, documentation and PR workflow.
