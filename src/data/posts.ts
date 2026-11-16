import type { ImageMetadata } from 'astro';

// Blog posts, newest first. Each post is a page at /blog/<slug>/.
export interface Post {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  tags: string[];
  readingMinutes: number;
  image?: string; // card thumbnail, a file in src/assets/blog/
  imageAlt?: string;
  ogImage?: string; // social preview, a path under public/
}

export const posts: Post[] = [
  {
    slug: 'fake-motion-fingerprint',
    title: 'Is there a fingerprint in AI-generated motion? I tested my own model',
    date: '2026-11-15',
    description:
      'A frequency-domain look at real and generated gestures: what energy and coordination reveal, what fooled me, and where ZeroEGGS differs from a real actor.',
    tags: ['motion', 'generative models', 'signal processing'],
    readingMinutes: 17,
    image: 'fake-motion-fingerprint.png',
    imageAlt:
      'Two drawings of hip angle against shoulder angle. Real walkers trace tight nested loops like a fingerprint; stitched fake walkers smear into a tangle.',
    ogImage: '/images/blog/fake-motion-fingerprint.png',
  },
];

const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/blog/*', { eager: true });

/** The post's card thumbnail, if it has one. */
export function postImage(post: Post): ImageMetadata | undefined {
  return post.image ? images[`/src/assets/blog/${post.image}`]?.default : undefined;
}
