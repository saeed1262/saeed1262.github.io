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

// Side projects: one Markdown file each in src/content/personal/, with a
// page at /personal/<file name>/. Image paths are relative to
// src/assets/personal/.
export const personalProjectSchema = z.object({
  title: z.string(),
  kind: z.string().optional(), // e.g. "Obsidian plugin"
  order: z.number().default(0), // lower comes first on the home page
  description: z.string(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  gallery: z
    .array(
      z.object({
        title: z.string(),
        items: z.array(z.object({ image: z.string(), caption: z.string(), alt: z.string().optional() })),
      }),
    )
    .default([]),
});

export const newsSchema = z.object({
  date: z.string(), // ISO yyyy-mm-dd
  text: z.string(),
});
