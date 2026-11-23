# Governance

InterestLoop is a single-maintainer-led open source project with community contributions.

## Roles

| Role | responsibilities |
| --- | --- |
| Project owner (@PraiseTechzw) | Final decision-maker; releases, repository settings, security response |
| Maintainers | Review PRs, triage issues, uphold the Code of Conduct |
| Contributors | Propose changes via issues and PRs; follow the Code of Conduct |

## Decision making

- **Small changes** (bug fixes, docs, tests): consensus among reviewers; the owner merges after CI is green.
- **Feature changes**: open an issue first so the problem and scope are agreed. Use the feature request template.
- **Breaking changes or architecture shifts**: require a written rationale, migration plan and explicit owner approval.
- Disagreements are resolved by the owner after discussion, with the reasoning recorded in the issue or PR.

## Change process

1. Discuss the change in an issue (unless it is trivial).
2. Fork/branch and implement with focused commits.
3. Open a PR using the template and link the issue.
4. CI must pass: dependency check, Expo Doctor, typecheck, lint, unit tests and web export.
5. A reviewer checks correctness and scope; the owner merges with squash.
6. Update the changelog and close the issue.

## Releases

- Version numbers follow semantic versioning where possible (`MAJOR.MINOR.PATCH`).
- Every merge to `main` that changes behaviour gets a changelog entry.
- Beta builds use the `preview` EAS profile; production builds and submissions require owner approval.
- Release notes are published as GitHub Releases.

## Code of conduct

All participation is governed by [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Violations can be reported privately as described there.
