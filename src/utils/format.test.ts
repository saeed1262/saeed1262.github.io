import { describe, it, expect } from 'vitest';
import { formatDate, formatYear } from '@/utils/format';

describe('formatDate', () => {
  it('formats an ISO date as "Mon YYYY"', () => {
    expect(formatDate('2026-02-01')).toBe('Feb 2026');
  });
  it('accepts a Date object', () => {
    expect(formatDate(new Date('2021-03-15'))).toBe('Mar 2021');
  });
});

describe('formatYear', () => {
  it('returns the year', () => {
    expect(formatYear('2024-09-01')).toBe(2024);
  });
});
