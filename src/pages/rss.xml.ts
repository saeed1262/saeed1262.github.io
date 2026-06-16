import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '@/data/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items: posts
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description ?? '',
        link: `/blog/${post.id}/`,
      })),
  });
}
