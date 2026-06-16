import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';
import { publicationSchema, projectSchema, newsSchema } from '@/schemas';

const yaml = (text: string) => parseYaml(text);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  loader: file('src/data/publications.yaml', { parser: yaml }),
  schema: publicationSchema,
});

const projects = defineCollection({
  loader: file('src/data/projects.yaml', { parser: yaml }),
  schema: projectSchema,
});

const news = defineCollection({
  loader: file('src/data/news.yaml', { parser: yaml }),
  schema: newsSchema,
});

export const collections = { blog, publications, projects, news };
