# Changelog

## 1.5.0 — Connectivity and custom interests (24 Nov 2026)

- Added NetInfo-backed connectivity state with React Query online/offline sync.
- Added user-created custom interests with a shared registry for services and UI.
- Kept the new EAS project and re-uploaded all three API keys.

## Unreleased — make it yours

### Added
- **Custom topics** — create your own interests with a name, colour, icon and news keywords. Your topics drive News, the Knowledge Graph, Learning Paths, Time Capsule and Search.
- **Capture a thought** — a personal notes screen for ideas, links and things you want to remember. Notes are taggable by topic, editable, searchable, and become steps in Learning Paths.
- **Backup & restore** — export all local data (including custom topics and notes) as JSON and restore it from the clipboard. Old backups without an `app` marker still import.
- Personal notes are counted in the Time Capsule snapshot.
- Unit tests for the interest catalogue, personal notes in learning paths, graph relationships for custom topics, backup validation and capsule text (54 tests total).

### Changed
- The app is now explicitly personal-only: the Community screen and its navigation entry were removed, feedback is labelled as a private note, and Search opens saved Discover finds.
- Learning Paths copy no longer promises a sample path (sample content was removed in 1.2.0).

## 1.4.0 — UI polish (24 Nov 2026)

- Flatter surfaces: cards have no resting shadows, smaller radius and one tone-step separation.
- Plain text navigation replaced icon-tile rows; profile metrics became a flat strip.
- Cleaner article/movie cards: one primary link, ratings as text, no emoji-as-icons.
- Stronger muted text contrast and tighter type tracking; added `DESIGN.md` as the design source of truth.
- Verified with the Impeccable detector and 390px production screenshots.

## 1.3.0 — Complete product screens (24 Nov 2026)

### Added
- Onboarding, article reader, movie detail, search, feedback, saved capsule gallery, diagnostics, data export, accessibility and terms screens.
- Saved capsules can be stored from the Time Capsule screen.
- `npm run env:check` preflight script and in-app connection status on the new Settings screen.
- Settings, Credits and Privacy screens; publishable privacy policy at `docs/PRIVACY.md`.
- Clear-local-data action with confirmation.

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
