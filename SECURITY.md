# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.1.x | ✅ |
| 1.0.x | ✅ (security fixes only) |
| < 1.0 | ❌ |

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Use GitHub's private vulnerability reporting: [Report a vulnerability](https://github.com/PraiseTechzw/interest-loop/security/advisories/new). If that is unavailable, email **praisetechzw@gmail.com** with:

- a description of the issue and its impact,
- steps to reproduce (a minimal repro helps),
- affected version, platform and environment,
- any suggested mitigation.

You should receive an acknowledgement within **3 business days** and a status update at least every **7 days** until resolution. We will credit reporters in the release notes unless they prefer to remain anonymous.

## What is in scope

- Authentication or authorisation bypasses (the current release has no accounts; future ones will)
- Data exposure across users or unintended local data leakage
- SQL injection or unsafe query construction in `src/lib/database.ts`
- Remote code execution or malicious input handling in feed adapters
- Vulnerabilities in pinned dependencies that affect shipped builds

## Out of scope

- Missing API keys (the app intentionally falls back to labelled sample data)
- Rate limits imposed by third-party APIs (NewsAPI, Reddit)
- Social engineering, physical attacks, or issues requiring already-compromised devices
- Reports generated solely by automated scanners without a demonstrated impact

## Safe harbour

We will not pursue legal action against researchers who act in good faith, avoid privacy violations, do not destroy data, and give us a reasonable time to fix the issue before public disclosure.

## Security practices in this repo

- All SQLite queries use bound parameters; no string interpolation of user input.
- No secrets or `.env` files are committed; `.env` is ignored and GitGuardian runs in CI.
- `EXPO_PUBLIC_*` keys are read-only public API keys only — never store secret credentials there.
- Time capsules exclude reflection text unless the user explicitly opts in.
