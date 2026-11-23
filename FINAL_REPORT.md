# InterestLoop — Final delivery report

**Prepared for:** Praise (project owner)
**Date:** 23 November 2026
**Repository:** https://github.com/PraiseTechzw/interest-loop
**Release:** MVP / Phases 1–2 complete

---

## 1. Executive summary

InterestLoop started this session as a non-compiling prototype: undeclared dependencies, APIs that do not exist in Expo SDK 58, placeholder API keys, seven broken screens and an untouched Expo template entry point. It is now a working, testable application with offline persistence, live data adapters with honest demo fallbacks, ten routes, and documentation that matches the code. The work was delivered through a reviewed pull request and merged to `main`.

---

## 2. Where we are now

| Item | Status |
| --- | --- |
| Repository / branch | `PraiseTechzw/interest-loop` → `main` is clean and up to date |
| Merged release | PR [#4](https://github.com/PraiseTechzw/interest-loop/pull/4) — squashed as `b7ab048` |
| Issues | #1, #2, #3 closed automatically by the merge |
| Stack | Expo SDK 58.0.26 · React Native 0.88.1 · React 19.3.0 · Expo Router 58 · TanStack Query 5 · expo-sqlite 58 |
| Platforms | Android, iOS, web (same codebase) |
| API keys | Optional; app runs in labelled demo mode without them. No keys committed. |
| Quality gate | Dependency check, Expo Doctor, typecheck, lint, web export, browser smoke test — all passing |
| CI | `.github/workflows/ci.yml` runs the same gates on PRs and pushes to `main` |
| Working tree | Clean |

### Delivered features

- **Home** — interest dashboard, top stories, movie picks, a hidden gem, quick links.
- **News** — NewsAPI adapter, interest filters, offline saves, pull-to-refresh.
- **Movies** — TMDB discovery by genre, offline saves, poster images when live.
- **Discover** — live Hacker News + Reddit, score/recency ranking, source filters.
- **Profile** — eight interest toggles, saved counts, data-source status.
- **Saved** — offline library for articles, movies and finds with removal.
- **Knowledge Graph** — SVG graph, pan/zoom, node details, relationship mapping.
- **Mindset Coach** — four thinking categories, saved reflections, spaced repetition.
- Dark mode (system), accessibility labels, loading/error/empty/content states throughout.

---

## 3. Team and agent contribution report

These roles were executed by OpenCode using specialist subagents and skills — there were no additional human team members. Praise acted as project owner and approver.

| Role | Executed by | Contribution | Evidence |
| --- | --- | --- | --- |
| **Project manager** | OpenCode (PM role) | Defined scope, sequenced foundation → data → screens → docs → QA → delivery; set the quality gate; drove the PR through review and merge; maintained logs | `PRAISSE_PROJECT_MANAGER_LOG.md`, PR #4 timeline |
| **Expo / React Native dev** | OpenCode + `expo-router` skill | SDK-compatible dependencies, `src/app` routing, tab group + pushed stack screens, app config, Metro WASM/COOP setup, EAS profiles | Clean `expo install --check`, `expo-doctor` 20/20, successful web export |
| **Data / backend dev** | OpenCode + `expo-data-fetching` skill | Versioned SQLite schema and parameterized CRUD, query-key registry, TanStack Query hooks, NewsAPI/TMDB/HN/Reddit adapters with demo fallback | `src/lib/database.ts`, `src/services/`, `src/hooks/`; browser save flows verified |
| **UI / UX dev** | OpenCode | Ten routes, reusable card/state/Pill components, light/dark design tokens, graph SVG interaction, accessibility labels | `src/app/`, `src/components/`, `src/theme/tokens.ts`; browser walkthrough |
| **QA engineer** | OpenCode + `agent-browser` skill | Static checks plus real Chrome smoke tests of every route and save flow; found four runtime bugs (NativeTabs web crash, disabled-query dereference, `Link asChild` style array, impure render call) | Verification table in §5; no active error overlay at handover |
| **Review agent** | Independent subagent (read-only) | Audited the full diff for runtime bugs, Expo API misuse, SQL injection, navigation and state gaps. Reported **no high-severity** findings and 11 medium/low items | All medium findings and the low-value ones fixed before merge; `fix:` commit pushed |
| **Documentation agent** | Explore subagent (read-only audit) + OpenCode | Audited seven stale docs, identified contradictory claims, rewrote them and created README / CONTRIBUTING / SCREEN_USAGE / `.env.example` | Docs in repo root; old versions backed up outside the repo |
| **Security review** | OpenCode + GitGuardian CI check | Confirmed no secrets or `.env` files tracked; all SQL parameterized; external links opened safely | GitGuardian check passed; `git ls-files` shows only `.env.example` |

### Skills and tooling used

`expo-router`, `expo-data-fetching`, `agent-browser`, versioned Expo SDK 58 documentation, Expo CLI (`install`, `doctor`, `export`, `lint`), GitHub CLI (`gh`), TypeScript, ESLint, Chrome browser automation.

---

## 4. Delivery metrics

| Metric | Value |
| --- | --- |
| PR | #4, merged 23 Nov 2026 18:11 UTC |
| Commits in feature branch | 7 (5 logical + CI + review fixes), squashed on `main` |
| Files changed | 50 |
| Lines added / removed | 11,019 / 1,199 |
| Routes | 10 (5 tabs + 3 stack screens + layouts) |
| Source/config files under `src/` and `.github/` | 29 |
| Issues closed | 3 (#1–#3) |

---

## 5. Verification evidence

| Check | Result |
| --- | --- |
| `npx expo install --check` | Dependencies up to date |
| `npx expo-doctor` | 20/20 checks passed |
| `npx tsc --noEmit` | No errors |
| `npx expo lint` | No errors or warnings |
| `npx expo export --platform web` | Bundled successfully (15 route chunks) |
| Chrome smoke test | All 5 tabs, save-to-SQLite, coach reflection save, graph node detail, stack navigation, no-interest edge case |
| CI on PR #4 | `verify` passed; GitGuardian passed; automated review completed |
| Post-merge `main` | Typecheck and lint re-run clean; working tree clean |

### Bugs found and fixed during QA and review

1. NativeTabs crashed on web when nested in the root Stack → replaced with Expo Router JS tabs.
2. Home dereferenced feed data while its query was disabled → explicit disabled/no-interest states added.
3. `Link asChild` rejected array-styled children → replaced with explicit `Pressable` navigation.
4. `Date.now()` called during render → replaced with a ticking clock query.
5. SQLite `datetime()` strings parsed incorrectly → normalized before `Date` parsing.
6. No recovery UI for database init failure → app error boundary added (`onError` is incompatible with `useSuspense`).
7. News interest tagging split on the wrong casing → case-insensitive matching on title/description/source.
8. Filter pills showed raw IDs (`ci`, `3d`) → human-readable labels.
9. Graph counts ignored movies/finds → v2 migration aggregates all saved content.
10. Coach could silently lose a reflection on save failure → draft retained and inline error shown.
11. One save spinner lit every card → per-item pending state.

---

## 6. Known limitations

- **NewsAPI free plan** restricts requests to localhost; on a physical device it may fall back to sample stories. A paid/appropriate key is needed for live mobile news.
- **Reddit** may rate-limit unauthenticated JSON requests; the app silently falls back to Hacker News and curated items.
- **API keys are client-side** (`EXPO_PUBLIC_*`), acceptable only for these read-only public APIs. Never put secret credentials there.
- **Web SQLite** requires COOP/COEP headers (configured in `metro.config.js` and `app.json`); third-party static hosts must forward those headers.
- The review agent noted transitive native-package version drift; Expo Doctor passes today, but re-run `expo install --fix` before an EAS build if dependencies change.

---

## 7. Where to go next (recommended order)

1. **Learning paths (#9)** — turn saved articles/movies into guided sequences with progress tracking. Highest product value from existing data.
2. **Community time-capsule (#10)** — shareable dated snapshot of interests and reflections; needs privacy review.
3. **Beta release (#12)** — `bunx eas-cli build --profile preview --platform android`, distribute internally, collect crash/feedback data via Expo Observe.
4. **Tests** — add Jest unit tests for pure logic (`src/lib/graph.ts`, `src/lib/format.ts`, `rankDiscovery`) and a Maestro flow for the core save journey.
5. **Polish** — gather device screenshots and run a visual/a11y audit before store submission.

---

## Appendix — how to run and hand over

```bash
npm install
cp .env.example .env          # optional API keys
npx expo start                # QR / a / i / w
npm run typecheck && npm run lint && npm run export:web
```

Broken prototype files and the superseded status documents are preserved outside the repository at `/tmp/opencode/interest-loop-legacy/` for reference. They are not part of the release.
