#!/usr/bin/env node
/**
 * Preflight check for EXPO_PUBLIC_* keys. Never prints key values.
 * Run before starting the app: npm run env:check
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED = [
  'EXPO_PUBLIC_NEWSAPI_KEY',
  'EXPO_PUBLIC_FREENEWS_KEY',
  'EXPO_PUBLIC_TMDB_KEY',
];
const OPTIONAL = ['EXPO_PUBLIC_PRIVACY_URL'];

function readDotEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    const result = {};
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const [key, ...rest] = line.split('=');
      result[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
    return result;
  } catch {
    return {};
  }
}

const fileValues = readDotEnv();
const valueOf = (key) => process.env[key] || fileValues[key] || '';

let requiredMissing = 0;
let optionalMissing = 0;
console.log('InterestLoop environment check\n');
for (const key of [...REQUIRED, ...OPTIONAL]) {
  const value = valueOf(key);
  const optional = OPTIONAL.includes(key);
  if (value) {
    console.log(`  ✓ ${key}: set (${value.length} chars)`);
  } else {
    if (optional) optionalMissing += 1;
    else requiredMissing += 1;
    console.log(`  ${optional ? '·' : '✗'} ${key}: ${optional ? 'not set (optional)' : 'NOT SET'}`);
  }
}

const summary =
  requiredMissing === 0
    ? 'All required live-feed keys are configured.'
    : `${requiredMissing} required key(s) not set — those feeds will show an empty state.`;
console.log(`\n${summary}${optionalMissing ? ' One or more optional settings are unset.' : ''}`);
console.log('Remember: restart Expo with `npx expo start -c` after changing .env.');
