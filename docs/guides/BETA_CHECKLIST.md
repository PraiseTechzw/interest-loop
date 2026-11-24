# Beta release checklist

Version: **1.1.0** · EAS project: `@praisetechzw/interest-loop`

## 1. Preconditions

- [x] Expo account authenticated (`npx eas-cli whoami`)
- [x] Project linked (`npx eas-cli project:info`)
- [x] `eas.json` profiles defined (development / preview / production)
- [x] CI green on the release PR (deps, doctor, typecheck, lint, tests, web export)
- [ ] API keys set in EAS for live feeds: `EXPO_PUBLIC_NEWSAPI_KEY`, `EXPO_PUBLIC_FREENEWS_KEY`, `EXPO_PUBLIC_TMDB_KEY` (configure with `eas env:create --scope project --environment preview`; local `.env` is not used by EAS builds)

## 2. Build

```bash
npx expo install --check
npx expo-doctor
npm run typecheck && npm run lint && npm test
npx expo export --platform web

# Internal Android beta (APK/AAB for testers)
npx eas-cli build --profile preview --platform android

# iOS needs Apple credentials in the Expo account
npx eas-cli build --profile preview --platform ios
```

Find artifacts at https://expo.dev/accounts/praisetechzw/projects/interest-loop/builds.

## 3. Install and smoke test

- [ ] Install the preview build on a physical Android device (Expo Orbit or internal link).
- [ ] Home loads with interests and at least one feed section.
- [ ] News/Movies/Discover fetch live data or show a clear error/empty state with retry.
- [ ] Saving an article works while offline, and it appears under Saved after a restart.
- [ ] Learning Paths progress survives a restart.
- [ ] Time Capsule copies/shares text; reflection text is absent unless toggled.
- [ ] Coach response saves and review scheduling updates.
- [ ] Dark mode and large text are legible.
- [ ] No crash on low-end device / slow network.

## 4. Privacy and data

- Reflection text is **never** included in a capsule unless the user switches it on.
- No analytics or crash SDK is wired yet; add Expo Observe before public beta.
- All saved data is local SQLite — no account or server sync.

## 5. Distribution

- [ ] Share internal build link with beta testers.
- [ ] Collect feedback in a single issue or discussion thread.
- [ ] Triage: crash > data loss > broken flow > visual polish.
- [ ] Promote to production profile only after beta sign-off:

```bash
npx eas-cli build --profile production --platform all
npx eas-cli submit --profile production
```
