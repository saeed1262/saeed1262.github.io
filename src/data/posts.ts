// Blog posts, newest first. Each post is a page at /blog/<slug>/.
export interface Post {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  tags: string[];
  readingMinutes: number;
}

export const posts: Post[] = [
  {
    slug: 'fake-motion-fingerprint',
    title: 'Is there a fingerprint in AI-generated motion? I tested my own model',
    date: '2026-11-15',
    description:
      'A frequency-domain look at real and generated gestures: what energy and coordination reveal, what fooled me, and where ZeroEGGS differs from a real actor.',
    tags: ['motion', 'generative models', 'signal processing'],
    readingMinutes: 12,
  },
];
