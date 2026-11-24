# Documentation index

All project documentation, organised by purpose. GitHub's standard community files (README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, GOVERNANCE, CHANGELOG) remain at the repository root where contributors expect them.

## Structure

```
interest-loop/
├── README.md                  # Start here: features, setup, scripts
├── CHANGELOG.md               # Release history
├── CONTRIBUTING.md            # Development workflow and definition of done
├── CODE_OF_CONDUCT.md         # Community standards
├── SECURITY.md                # Vulnerability reporting
├── SUPPORT.md                 # Where to get help
├── GOVERNANCE.md              # Roles and decisions
├── LICENSE
├── .github/                   # Issue/PR templates, CI, Dependabot, CODEOWNERS
├── .maestro/                  # E2E flow
├── __tests__/                 # Jest unit tests
├── assets/                    # App icons
├── src/                       # Application source (see below)
└── docs/                      # This directory
    ├── guides/                # How to use and release
    ├── project/               # Roadmap and planning
    └── reports/               # Status, delivery and team reports
```

## Source layout

```
src/
├── app/           # Expo Router routes (tab group + pushed stack screens)
├── components/    # Reusable UI primitives and content cards
├── constants/     # Interest catalogue and relationships
├── hooks/         # TanStack Query hooks
├── lib/           # Database, API wrapper, graph, capsule, formatting, links
├── services/      # News, movies, discovery adapters
├── theme/         # Design tokens (light/dark)
└── types/         # Shared models
```

Non-route code never lives in `src/app/`.

## Guides

| Document | Purpose |
| --- | --- |
| [guides/SCREEN_USAGE.md](./guides/SCREEN_USAGE.md) | Walkthrough of every screen |
| [guides/ASSET_SPECS.md](./guides/ASSET_SPECS.md) | Exact sizes, safe zones and prompts for every brand/store asset |
| [guides/BETA_CHECKLIST.md](./guides/BETA_CHECKLIST.md) | Release testing, privacy and distribution |

## Project

| Document | Purpose |
| --- | --- |
| [project/GITHUB_ROADMAP.md](./project/GITHUB_ROADMAP.md) | Delivered work and remaining candidates |

## Reports and history

| Document | Purpose |
| --- | --- |
| [reports/FINAL_REPORT.md](./reports/FINAL_REPORT.md) | Delivery, team/agent contributions and current state |
| [reports/DEVELOPMENT_COMPLETE.md](./reports/DEVELOPMENT_COMPLETE.md) | Feature status and verification evidence |
| [reports/IMPLEMENTATION_LOG.md](./reports/IMPLEMENTATION_LOG.md) | Session-by-session implementation notes |
| [reports/LAST_SESSION_SUMMARY.md](./reports/LAST_SESSION_SUMMARY.md) | Latest handover summary |
| [reports/PRAISSE_PROJECT_MANAGER_LOG.md](./reports/PRAISSE_PROJECT_MANAGER_LOG.md) | Scope, decisions and delivery timeline |
| [reports/TEAMS_READY.md](./reports/TEAMS_READY.md) | Agent roles and how to re-run the pipeline |
| [reports/TEAM_STRUCTURE_EXPANDED.md](./reports/TEAM_STRUCTURE_EXPANDED.md) | Expanded team boundaries and release stop condition |
