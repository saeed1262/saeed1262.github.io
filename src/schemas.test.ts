import { describe, it, expect } from 'vitest';
import { publicationSchema, personalProjectSchema, newsSchema } from '@/schemas';

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

describe('personalProjectSchema', () => {
  it('accepts a project with links', () => {
    const proj = {
      title: 'Isfahan',
      description: 'Persian tilework for Obsidian.',
      links: [{ label: 'GitHub', url: 'https://github.com/saeed1262/isfahan-look' }],
    };
    expect(personalProjectSchema.safeParse(proj).success).toBe(true);
  });

  it('rejects a link without a valid URL', () => {
    const bad = { title: 'x', description: 'y', links: [{ label: 'GitHub', url: 'not a url' }] };
    expect(personalProjectSchema.safeParse(bad).success).toBe(false);
  });
});
