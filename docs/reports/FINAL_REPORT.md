# InterestLoop — Delivery report

**Prepared for:** Praise (project owner)
**Updated:** 23 November 2026 · **Version:** 1.1.0
**Repository:** https://github.com/PraiseTechzw/interest-loop

---

## 1. Executive summary

InterestLoop began as a non-compiling prototype with phantom APIs, undeclared dependencies and seven broken screens. Phase 1 delivered a working Expo SDK 58 app with offline data, live feeds with honest demo fallback, full documentation and a reviewed merge to `main`. Phase 2/3 (this pass) added guided learning paths, a privacy-aware time capsule, an automated test suite, a Maestro E2E flow and beta-release preparation. All work goes through PRs with CI gates.

---

## 2. Where we are now

| Item | Status |
| --- | --- |
| Repository / branch | `PraiseTechzw/interest-loop` · release work on `feat/phase-3-4` |
| Merged releases | PR [#4](https://github.com/PraiseTechzw/interest-loop/pull/4) (MVP) and PR [#5](https://github.com/PraiseTechzw/interest-loop/pull/5) (report) merged to `main` |
| In review | PR for Phase 3/4: learning paths, time capsule, tests, beta prep (closes issues #6–#8) |
| Issues | #1–#3 closed; #6–#8 created for this phase |
| Stack | Expo SDK 58 · React Native 0.88.1 · React 19.3.0 · Expo Router 58 · TanStack Query 5 · expo-sqlite 58 |
| Quality gate | Dependencies, Expo Doctor 20/20, typecheck, lint, 27 unit tests, web export, browser smoke test — all green |
| CI | `.github/workflows/ci.yml` runs every gate on PRs |
| EAS | Linked project `@praisetechzw/interest-loop`; authenticated as `praisetechzw`; preview build prepared |

### Feature inventory

| Feature | Status |
| --- | --- |
| Home dashboard with quick actions | ✅ |
| News (NewsAPI + FreeNewsApi + curated fallback, offline saves) | ✅ |
| Movies (TMDB by genre, offline saves) | ✅ |
| Discover (Hacker News + Reddit, ranking, filters) | ✅ |
| Knowledge Graph (SVG, pan/zoom, topic details) | ✅ |
| Mindset Coach (spaced repetition) | ✅ |
| Profile & Saved library | ✅ |
| **Learning Paths** (new) — ordered steps from saved content, progress in SQLite, sample paths | ✅ |
| **Time Capsule** (new) — dated shareable snapshot, reflection text opt-in | ✅ |
| Dark mode, accessibility, loading/error/empty states | ✅ |
| **Unit + E2E tests** (new) | ✅ |

---

## 3. Team and agent contribution report

These roles were executed by OpenCode using specialist subagents and skills; there were no additional human staff. Praise was the project owner and approver.

| Role | Executed by | Contribution | Evidence |
| --- | --- | --- | --- |
| **Project manager** | OpenCode (PM role) | Scoped both phases, created tracking issues, set quality gates, sequenced work, drove PRs and merge, maintained logs | `PRAISSE_PROJECT_MANAGER_LOG.md`, PR timeline |
| **Expo / React Native dev** | OpenCode + `expo-router` skill | SDK 58 foundation, `src/app` routing, tab + stack navigation, config, Metro/EAS setup | `expo install --check` clean, Doctor 20/20, export green |
| **Data / backend dev** | OpenCode + `expo-data-fetching` skill | SQLite migrations v1→v3, parameterized CRUD, query hooks, four feed adapters, learning-path domain logic | `src/lib/database.ts`, `src/lib/learning-paths.ts`, `src/services/` |
| **UI / UX dev** | OpenCode | Ten routes, card/state components, light/dark tokens, SVG graph, paths UI, capsule UI, accessibility labels | `src/app/`, `src/components/`, `src/theme/tokens.ts` |
| **QA engineer** | OpenCode + `agent-browser` skill | Static checks and Chrome smoke tests; found four runtime bugs in phase 1; verified new routes and age/limitations | Verification table in §5 |
| **Review agent** | Independent subagent (read-only) | Audited the MVP diff; no high-severity findings; 11 medium/low findings fixed before merge | `fix:` commit on the MVP branch |
| **Test engineer** | Independent subagent | Created 27 unit tests across graph/format/discovery plus a 16-step Maestro flow; all tests passing | `__tests__/`, `.maestro/save-journey.yml`, CI step |
| **Documentation agent** | Explore subagent + OpenCode | Audited stale docs, rewrote them, created README, guides, changelog, beta checklist, updated this report | Docs in repo root |
| **Security** | OpenCode + GitGuardian CI | No secrets tracked, SQL parameterized, capsule reflections opt-in | GitGuardian passed; `git ls-files` clean |

### Skills and tooling

`expo-router`, `expo-data-fetching`, `agent-browser`, versioned Expo docs, Expo CLI, Jest + `jest-expo`, Maestro flow syntax, GitHub CLI, EAS CLI.

---

## 4. Delivery metrics

| Metric | MVP (PR #4) | Phase 3/4 (this pass) |
| --- | --- | --- |
| Files changed | 50 | 20+ (new screens, tables, tests, docs) |
| Lines added / removed | 11,019 / 1,199 | ~1,800 / ~120 |
| Routes | 10 | 12 (added learning + capsule) |
| Tests | 0 | 27 unit tests + 1 E2E flow |
| Issues closed | #1–#3 | #6–#8 (on merge) |

---

## 5. Verification evidence

| Check | Result |
| --- | --- |
| `npx expo install --check` | Dependencies up to date |
| `npx expo-doctor` | 20/20 checks passed |
| `npx tsc --noEmit` | No errors |
| `npx expo lint` | No errors or warnings |
| `npm test` | 3 suites, 27 tests passed |
| `npx expo export --platform web` | Bundled successfully |
| Browser smoke test (Chrome) | All routes, save flows, coach, graph, no-interest state; no active error overlay |
| CI | Dependency check, doctor, typecheck, lint, tests, web export, GitGuardian all pass |
| EAS | Authenticated, project linked, preview build prepared (see beta checklist) |

### Notable bugs fixed

MVP phase: NativeTabs web crash, disabled-query dereference, `Link asChild` style array, impure render call, SQLite datetime parsing, database error boundary, news tagging, filter labels, graph counts, coach draft loss, per-card save spinners.

Phase 3/4: none found yet — new code passed static checks and tests on first pass; browser QA pending on the release branch.

---

## 6. Known limitations

- **NewsAPI free plan** restricts live mobile requests; falls back to sample stories on a device without a suitable key.
- **Reddit** may rate-limit unauthenticated JSON requests; the app falls back to Hacker News/curated items.
- **API keys are client-side** (`EXPO_PUBLIC_*`) and only suitable for these read-only public APIs.
- **Web SQLite** needs COOP/COEP headers (configured); third-party hosts must forward them.
- **iOS preview** requires Apple credentials in the Expo account; Android preview is unblocked.
- No telemetry or account sync yet.

---

## 7. Next steps

1. Run the [beta checklist](../guides/BETA_CHECKLIST.md) on a physical device, collect feedback, triage by crash → data loss → broken flow → visual polish.
2. Add Expo Observe before public beta for crash/performance telemetry.
3. Consider account sync and a community feed only after beta validates demand.

---

## Appendix — commands

```bash
npm install
cp .env.example .env          # optional API keys
npx expo start                # QR / a / i / w
npm run typecheck && npm run lint && npm test && npm run export:web
npx eas-cli build --profile preview --platform android
```

Broken prototype files and superseded docs remain outside the repo at `/tmp/opencode/interest-loop-legacy/`.
