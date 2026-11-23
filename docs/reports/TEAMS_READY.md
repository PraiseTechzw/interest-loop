# Agent teams — ready state

This project uses specialist agent roles for each delivery. The roles are process definitions; any agent runtime can play them.

| Role | Responsibility | Done when |
| --- | --- | --- |
| Dev agent | Implement routes, services, SQLite, UI per approved plan | Typecheck + lint clean, features demonstrable |
| QA agent | Browser/device smoke tests, report repro steps | All routes and save flows verified, no error overlay |
| Documentation agent | Keep README, roadmap and logs truthful | Docs match code and verification evidence |
| Review agent | Check diffs for correctness, security, API misuse | Findings resolved, PR approved |
| Project manager | Scope, sequencing, risk, quality gate | Milestones tracked, merge completed |

## Current state

All roles have completed the current delivery. Quality gate results are recorded in [DEVELOPMENT_COMPLETE.md](./DEVELOPMENT_COMPLETE.md).

## How to re-run

1. PM confirms scope and branch.
2. Dev implements with atomic commits.
3. QA runs: `npm run typecheck`, `npm run lint`, `npx expo export --platform web`, browser smoke test.
4. Review checks the diff and PR description.
5. PM merges and updates the log.
