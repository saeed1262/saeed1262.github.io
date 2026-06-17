import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';
import { publicationSchema, projectSchema, newsSchema } from '@/schemas';

const yaml = (text: string) => parseYaml(text);

const publications = defineCollection({
  loader: file('src/data/publications.yaml', { parser: yaml }),
  schema: publicationSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

const news = defineCollection({
  loader: file('src/data/news.yaml', { parser: yaml }),
  schema: newsSchema,
});

export const collections = { publications, projects, news };
