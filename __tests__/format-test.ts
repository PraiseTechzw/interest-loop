import { formatDate, formatRating, initials, parseDate, truncate } from '@/lib/format';

describe('parseDate', () => {
  it('treats a SQLite datetime string as UTC', () => {
    const date = parseDate('2026-11-23 10:30:00');

    expect(date.toISOString()).toBe('2026-11-23T10:30:00.000Z');
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(10);
    expect(date.getUTCDate()).toBe(23);
    expect(date.getUTCHours()).toBe(10);
    expect(date.getUTCMinutes()).toBe(30);
    expect(date.getUTCSeconds()).toBe(0);
  });

  it('preserves an explicit UTC ISO string', () => {
    expect(parseDate('2026-11-23T10:30:00Z').toISOString()).toBe('2026-11-23T10:30:00.000Z');
  });

  it('returns an invalid Date for unparseable input', () => {
    expect(Number.isNaN(parseDate('not a date').getTime())).toBe(true);
  });
});

describe('formatDate', () => {
  it('formats a SQLite timestamp using its UTC calendar date', () => {
    const expected = new Date('2026-11-23T10:30:00Z').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    expect(formatDate('2026-11-23 10:30:00')).toBe(expected);
  });

  it('returns an empty string for invalid input', () => {
    expect(formatDate('definitely-not-a-date')).toBe('');
  });
});

describe('formatRating', () => {
  it('shows one decimal place for positive ratings', () => {
    expect(formatRating(8.5)).toBe('8.5');
    expect(formatRating(7.123)).toBe('7.1');
    expect(formatRating(4)).toBe('4.0');
    expect(formatRating(0.04)).toBe('0.0');
  });

  it('shows a dash for zero and negative ratings', () => {
    expect(formatRating(0)).toBe('—');
    expect(formatRating(-2.5)).toBe('—');
  });
});

describe('truncate', () => {
  it('collapses whitespace and trims', () => {
    expect(truncate('  Hello   world  ', 20)).toBe('Hello world');
    expect(truncate('one\ttwo\nthree', 20)).toBe('one two three');
  });

  it('leaves text shorter than or equal to the limit untouched', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('exact', 5)).toBe('exact');
  });

  it('truncates with a single ellipsis within the limit', () => {
    const result = truncate('hello world', 5);
    expect(result).toBe('hell…');
    expect(result).toHaveLength(5);
    expect(truncate('a very long headline that keeps going', 12)).toBe('a very long…');
  });
});

describe('initials', () => {
  it('uses the first letter of the first two words, uppercased', () => {
    expect(initials('Ada Lovelace')).toBe('AL');
    expect(initials('  john   von  neumann ')).toBe('JV');
    expect(initials('one two three')).toBe('OT');
  });

  it('handles single words and empty input', () => {
    expect(initials('Cher')).toBe('C');
    expect(initials('')).toBe('');
    expect(initials('   ')).toBe('');
  });
});
