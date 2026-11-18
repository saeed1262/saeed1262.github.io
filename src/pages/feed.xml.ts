import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts } from '@/data/posts';
import { site } from '@/data/site';

// The blog's RSS feed, at /feed.xml.
export function GET(context: APIContext) {
  return rss({
    title: `${site.name}: Blog`,
    description: 'Writing on motion, machine learning and generative models.',
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.title,
      description: p.description,
      pubDate: new Date(p.date),
      link: `/blog/${p.slug}/`,
      categories: p.tags,
    })),
    customData: '<language>en</language>',
  });
}
