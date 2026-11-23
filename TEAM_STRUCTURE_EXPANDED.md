# Expanded team structure

## Delivery pipeline

```
PM (scope + gate)
  → Dev (foundation → data layer → screens)
    → QA (static checks + browser smoke test)
      → Review (diff review + PR)
        → PM (merge + logs)
```

## Specialists and their boundaries

- **Expo/React Native dev** — owns `src/`, app config, dependency versions. Must consult versioned Expo docs before API changes.
- **Data/backend dev** — owns `src/lib/database.ts`, `src/services/`, query keys and hooks. All remote failures must degrade gracefully.
- **UI/UX dev** — owns `src/components/` and `src/theme/tokens.ts`. Must support system light/dark and accessible labels.
- **QA engineer** — read-only on source during a test pass; files bugs with repro steps, then the dev fixes them.
- **Documentation lead** — owns all Markdown docs; removes stale or contradictory status claims.
- **Security reviewer** — checks that no API keys/secrets are committed, SQL is parameterized, and external links are opened safely.
- **Project manager** — owns scope, milestones, PR quality and the final merge.

## Stop condition for a release

All of: typecheck clean, lint clean, expo-doctor clean, dependencies validated, web export successful, browser smoke test of every route, PR reviewed and merged, docs updated.
