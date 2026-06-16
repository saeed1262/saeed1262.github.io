import { describe, it, expect } from 'vitest';
import { publicationSchema, newsSchema } from '@/schemas';

describe('publicationSchema', () => {
  it('accepts a valid publication', () => {
    const pub = {
      title: 'ZeroEGGS',
      authors: 'S. Ghorbani et al.',
      venue: 'Computer Graphics Forum',
      year: 2023,
      links: { pdf: 'https://example.com/p.pdf' },
    };
    expect(publicationSchema.safeParse(pub).success).toBe(true);
  });

  it('rejects a publication missing a title', () => {
    const bad = { authors: 'x', venue: 'y', year: 2023 };
    expect(publicationSchema.safeParse(bad).success).toBe(false);
  });
});

describe('newsSchema', () => {
  it('requires a date and text', () => {
    expect(newsSchema.safeParse({ date: '2026-02-01', text: 'Joined' }).success).toBe(true);
    expect(newsSchema.safeParse({ text: 'no date' }).success).toBe(false);
  });
});
