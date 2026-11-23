# Implementation log

## 2026-11-23 — Phase 3/4: learning paths, time capsule, tests, beta prep

- Added SQLite schema v3 (`learning_progress`) and domain logic in `src/lib/learning-paths.ts`: ordered paths from saved articles/movies/finds, sample paths when empty, per-step completion hooks and reset.
- Added `src/app/learning.tsx` (progress bars, step checkboxes, external links) and linked it from Home and Profile.
- Added `src/lib/capsule.ts` and `src/app/capsule.tsx`: dated snapshot, top topics, opt-in reflection text, clipboard/native share. Added `expo-clipboard`.
- Added Jest 30 + jest-expo 58 configuration, 27 unit tests and `.maestro/save-journey.yml`; CI now runs `npm test`.
- Bumped version to 1.1.0, added CHANGELOG.md and BETA_CHECKLIST.md, simplified EAS profiles, wired unit tests into CI.
- Verified: install check, doctor 20/20, typecheck, lint, 27 tests, web export all pass. EAS project linked; preview build prepared.

## 2026-11-23 — Full rebuild and delivery (branch `feat/complete-app`)

**Starting state:** seven non-compiling prototype screens, phantom imports (`@expo/sqlite`, `AppRouterProvider`), missing dependencies, hardcoded API keys, and an untouched Expo template entry point.

**Work performed**

1. Replaced the fabricated dependency list with SDK 58-compatible packages installed via `npx expo install`; added peer dependencies flagged by Expo Doctor. Resolved a `react`/`react-dom` mismatch by pinning `react-dom@19.3.0`.
2. Backed up the broken prototype to `/tmp/opencode/interest-loop-legacy/` and rebuilt the app under `src/app/` using Expo Router (tab group + pushed stack screens).
3. Implemented a versioned SQLite layer with parameterized CRUD and simplified spaced repetition; wired it through `SQLiteProvider` and TanStack Query hooks.
4. Rebuilt all seven screens plus a Saved library, with loading/error/empty/content states, pull-to-refresh, interest filters, dark mode and accessibility labels.
5. Added real adapters: NewsAPI, TMDB, Hacker News, Reddit — each degrading to curated demo data with a visible notice.
6. Added ESLint flat config, Metro WASM/COOP config, EAS profiles, `.env.example` and full documentation.
7. Verified: expo install --check clean, expo-doctor 20/20, tsc clean, lint clean, web export successful, browser QA of all flows.

**Bugs found and fixed during browser QA**

- `NativeTabs` crashed on web when nested inside the root Stack → replaced with Expo Router JS `Tabs` (reliable on web and device).
- Home screen dereferenced `movies.data.items` while the query was disabled → guarded on missing data (disabled queries are not loading).
- Expo Router `Slot` rejected array-styled `Link asChild` children → replaced with explicit `Pressable` navigation.
- Coach screen called `Date.now()` during render → switched to TanStack Query's `dataUpdatedAt`.

**Post-review fixes (same day)**
- Home now renders explicit loading/error/empty/no-interest states instead of spinning forever when all interests are deselected; per-card save spinners are isolated.
- SQLite `datetime()` strings are normalized before `Date` parsing, fixing due-date math in Coach.
- Added an app error boundary around SQLite initialization (`onError` is incompatible with `useSuspense`, so the boundary is the recovery path).
- News interest tagging now matches on title/description/source with a case-insensitive `OR` split; filter pills use human-readable labels.
- Interest activity counts now include movies and discoveries via a v2 schema migration; Coach uses a ticking clock query and keeps drafts on save failure.

**Result:** one coherent, compiling, testable application; documentation now matches the code.
