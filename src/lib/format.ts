/**
 * SQLite's datetime()/CURRENT_TIMESTAMP produce "YYYY-MM-DD HH:mm:ss" in UTC.
 * Normalise that format before handing it to Date, which otherwise interprets
 * it as local time on V8 and can fail on Hermes.
 */
export function parseDate(value: string): Date {
  const sqliteTimestamp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  const normalized = sqliteTimestamp.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;
  return new Date(normalized);
}

export function formatDate(value: string): string {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatRating(value: number): string {
  return value > 0 ? value.toFixed(1) : '—';
}

export function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function initials(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}
