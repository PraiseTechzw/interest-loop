# Contributing to InterestLoop

## Ground rules

1. Expo SDK 58 is the source of truth. Before changing an Expo/RN API, check the versioned docs at https://docs.expo.dev/versions/v58.0.0/. Do not rely on old API names.
2. Routes go in `src/app/`. Everything else (components, hooks, services, types) goes in `src/` outside `app/`.
3. Use `npx expo install <package>` for native modules so versions match the SDK.
4. Use `fetch` via `src/lib/api.ts`; do not add axios.
5. Design tokens come from `src/theme/tokens.ts`. Support light and dark mode and add accessibility labels to interactive elements.

## Local workflow

```bash
npm install
cp .env.example .env
npx expo start
```

## Before opening a PR

All of these must pass:

```bash
npx expo install --check
npx tsc --noEmit
npm run lint
npx expo-doctor
npm run export:web
```

Also smoke-test the changed screens in the browser (`npx expo start --web`) or on a device.

## Commit style

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`. One logical change per commit. PR titles follow the same convention and reference the issue they close.

## Adding a feature

- New data source: add an adapter in `src/services/` returning `{ items, isDemo, notice }`, add a query key, add a hook, then build the UI with loading/error/empty/content states.
- New screen: create the route in `src/app/`, add it to the root `Stack` if it should push with a back button, or to the tab layout if it is a top-level destination.
- New persisted data: add a migration in `migrateDatabase()` (bump `SCHEMA_VERSION`) and parameterized queries in `src/lib/database.ts`.
