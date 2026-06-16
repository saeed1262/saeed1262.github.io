import { z } from 'astro/zod';

export const publicationSchema = z.object({
  title: z.string(),
  authors: z.string(),
  venue: z.string(),
  year: z.number(),
  award: z.string().optional(),
  abstract: z.string().optional(),
  links: z
    .object({
      pdf: z.string().url().optional(),
      code: z.string().url().optional(),
      project: z.string().url().optional(),
      bibtex: z.string().optional(),
    })
    .default({}),
});

export const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
});

export const newsSchema = z.object({
  date: z.string(), // ISO yyyy-mm-dd
  text: z.string(),
});
