import { z } from 'astro/zod';

export const publicationSchema = z.object({
  title: z.string(),
  authors: z.string(),
  venue: z.string(),
  year: z.number(),
  abbr: z.string().optional(),
  award: z.string().optional(),
  abstract: z.string().optional(),
  topics: z.array(z.string()).default([]),
  links: z
    .object({
      pdf: z.url().optional(),
      code: z.url().optional(),
      project: z.url().optional(),
      bibtex: z.string().optional(),
    })
    .default({}),
});

export const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  url: z.url().optional(),
  tags: z.array(z.string()).default([]),
});

export const newsSchema = z.object({
  date: z.string(), // ISO yyyy-mm-dd
  text: z.string(),
});
