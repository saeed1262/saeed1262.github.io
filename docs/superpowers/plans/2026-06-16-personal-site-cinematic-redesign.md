# Personal Site — Cinematic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Saeed Ghorbani's personal site as a cinematic, scroll-driven Astro site (static, GitHub Pages), preserving all existing content.

**Architecture:** Astro static-output site. Content modeled as typed collections (markdown blog + YAML data for publications/projects/news). The page ships as static HTML/CSS; a deferred client `<script>` lazy-imports Three.js for an abstract "latent-space" particle hero, and a global motion script wires Lenis smooth-scroll + GSAP ScrollTrigger reveals, all guarded by `prefers-reduced-motion`. Cinematic home page; calmer, readable inner pages sharing the design system. Deployed via GitHub Actions to GitHub Pages.

**Tech Stack:** Astro 5 + TypeScript, Three.js (WebGL hero), GSAP + ScrollTrigger, Lenis, Vitest + Astro Container API (tests), `@astrojs/rss` + `@astrojs/sitemap`, `yaml`.

**Source of truth for migrated content:** the current Jekyll repo `saeed1262/saeed1262.github.io` (al-folio): blog posts in `_posts/`, publications in `_bibliography/papers.bib`, news in `_news/`, projects in `_projects/`, assets/CV in `assets/`.

---

## File Structure

```
package.json                     # deps + scripts
astro.config.mjs                 # site/base, integrations
tsconfig.json                    # strict TS + path aliases
vitest.config.ts                 # test runner config
.github/workflows/deploy.yml     # build + deploy to Pages
src/
  schemas.ts                     # zod schemas (shared by content config + tests)
  content.config.ts              # Astro collections (blog, publications, projects, news)
  data/
    site.ts                      # name, links, SEO defaults (single source of truth)
    publications.yaml            # ported papers
    projects.yaml                # ported projects
    news.yaml                    # ported timeline/news
  utils/
    format.ts                    # date/citation formatting helpers
  styles/
    tokens.css                   # palette, type scale, spacing, motion vars
    global.css                   # resets, base element styles, fonts
  scripts/
    motion.ts                    # Lenis + GSAP ScrollTrigger init (reduced-motion aware)
    hero/particles.ts            # Three.js ParticleField class (latent-space hero)
  layouts/
    BaseLayout.astro             # <head>/SEO/meta, global styles+scripts, header/footer
    PostLayout.astro             # blog post wrapper (calm, readable)
  components/
    ui/
      SectionHeading.astro
      Button.astro
      Card.astro
      Cursor.astro               # animated custom cursor (desktop)
      Reveal.astro               # wraps children with [data-reveal] for GSAP
    Hero.astro                   # full-viewport hero + canvas + deferred WebGL script
    sections/
      About.astro
      Timeline.astro
      Publications.astro
      Projects.astro
      BlogTeaser.astro
    SiteHeader.astro
    SiteFooter.astro
  pages/
    index.astro                  # cinematic home (composes sections)
    publications.astro           # full publications page
    cv.astro                     # CV page (+ link to PDF)
    blog/index.astro             # blog index
    blog/[...slug].astro         # individual posts
    rss.xml.ts                   # RSS feed
    404.astro
public/
  fonts/                         # self-hosted Clash Display + Inter (woff2)
  images/                        # headshot, project images, og
  cv.pdf
```

---

## Phase 0 — Scaffolding & tooling

### Task 0.1: Initialize Astro project + dependencies

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`

- [ ] **Step 1: Create the Astro project in-place**

Run (the repo root already exists with `docs/` and `.git`):
```bash
npm create astro@latest -- --template minimal --no-install --no-git --yes .
```
Expected: scaffolds `src/`, `public/`, `package.json`, `astro.config.mjs` without touching git.

- [ ] **Step 2: Install runtime + dev dependencies**

```bash
npm install three gsap lenis yaml @astrojs/rss @astrojs/sitemap
npm install -D vitest @types/three typescript
```
Expected: dependencies added, `package-lock.json` created.

- [ ] **Step 3: Add test + typecheck scripts to `package.json`**

In `package.json`, set the `"scripts"` block to exactly:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Configure `astro.config.mjs` for GitHub Pages**

Replace `astro.config.mjs` with:
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// User site (saeed1262.github.io) deploys at domain root => no base path.
export default defineConfig({
  site: 'https://saeed1262.github.io',
  integrations: [sitemap()],
  prefetch: true,
});
```

- [ ] **Step 5: Set strict TypeScript + path alias in `tsconfig.json`**

Replace `tsconfig.json` with:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 6: Verify the project builds**

Run: `npm run build`
Expected: build succeeds, emits `dist/` with the default page.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with GitHub Pages config"
```

### Task 0.2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

Astro ships a Vitest config helper that wires its module resolution.
```ts
/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

- [ ] **Step 2: Add a smoke test to prove the runner works**

Create `src/utils/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 4: Delete the smoke test and commit**

```bash
rm src/utils/smoke.test.ts
git add -A
git commit -m "test: add vitest config"
```

---

## Phase 1 — Design system

### Task 1.1: Self-host fonts

**Files:**
- Create: `public/fonts/` (woff2 files), `src/styles/global.css` (`@font-face` block)

- [ ] **Step 1: Download the fonts as woff2 into `public/fonts/`**

Clash Display (display) from Fontshare and Inter (body) from rsms/inter. Place these files in `public/fonts/`:
`ClashDisplay-Semibold.woff2`, `ClashDisplay-Bold.woff2`, `Inter-Regular.woff2`, `Inter-Medium.woff2`, `Inter-SemiBold.woff2`.

```bash
mkdir -p public/fonts
# Download Clash Display from https://www.fontshare.com/fonts/clash-display (free)
# Download Inter woff2 from https://github.com/rsms/inter/releases (OFL)
# Copy the five woff2 files listed above into public/fonts/
```
Expected: five `.woff2` files present in `public/fonts/`.

- [ ] **Step 2: Declare `@font-face` in `src/styles/global.css`**

Create `src/styles/global.css`:
```css
@font-face {
  font-family: 'Clash Display';
  src: url('/fonts/ClashDisplay-Semibold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: 'Clash Display';
  src: url('/fonts/ClashDisplay-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: self-host Clash Display + Inter fonts"
```

### Task 1.2: Design tokens

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/styles/global.css` (append resets + base styles)

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  /* palette */
  --bg: #0a0b0f;
  --bg-deep: #050608;
  --surface: #12141c;
  --text: #f4f4f5;
  --text-muted: #9ca3af;
  --accent-from: #22d3ee;
  --accent-to: #818cf8;
  --accent-gradient: linear-gradient(120deg, var(--accent-from), var(--accent-to));
  --border: #21242e;

  /* type */
  --font-display: 'Clash Display', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --step--1: clamp(0.83rem, 0.8rem + 0.16vw, 0.94rem);
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.13rem);
  --step-1: clamp(1.2rem, 1.1rem + 0.5vw, 1.5rem);
  --step-2: clamp(1.44rem, 1.3rem + 0.9vw, 2rem);
  --step-3: clamp(1.73rem, 1.5rem + 1.6vw, 2.66rem);
  --step-4: clamp(2.07rem, 1.7rem + 2.8vw, 3.55rem);
  --step-5: clamp(2.49rem, 1.9rem + 4.6vw, 4.74rem);

  /* spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 8rem;
  --container: 72rem;

  /* motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 0.6s;
}
```

- [ ] **Step 2: Append resets + base styles to `src/styles/global.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { font-family: var(--font-display); line-height: 1.05; font-weight: 600; }
a { color: inherit; text-decoration: none; }
img, picture, canvas { max-width: 100%; display: block; }
.container { width: min(100% - 2rem, var(--container)); margin-inline: auto; }
.accent-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
:focus-visible { outline: 2px solid var(--accent-from); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 3: Verify build still succeeds**

Run: `npm run build`
Expected: success (CSS not yet imported anywhere — that happens in Task 1.3).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add design tokens and base styles"
```

### Task 1.3: BaseLayout with SEO

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/data/site.ts`

- [ ] **Step 1: Write `src/data/site.ts`**

```ts
export const site = {
  name: 'Saeed Ghorbani',
  title: 'Saeed Ghorbani',
  role: 'Machine Learning Engineer',
  email: 'saeed.ghorbani1262@gmail.com',
  description:
    'Machine learning engineer. Research background in deep learning, computer vision and human motion.',
  url: 'https://saeed1262.github.io',
  links: {
    github: 'https://github.com/saeed1262',
    linkedin: 'https://www.linkedin.com/in/saeed-ghorbani-ba4872136',
    twitter: 'https://twitter.com/SaGhorbani',
    scholar: 'https://scholar.google.com/citations?user=', // fill exact id during migration
  },
} as const;
```

- [ ] **Step 2: Write `src/layouts/BaseLayout.astro`**

```astro
---
import '@/styles/tokens.css';
import '@/styles/global.css';
import { site } from '@/data/site';

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}
const { title, description = site.description, ogImage = '/images/og-default.png' } = Astro.props;
const pageTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`;
const canonical = new URL(Astro.url.pathname, site.url).toString();
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="preload" href="/fonts/ClashDisplay-Semibold.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, site.url).toString()} />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="alternate" type="application/rss+xml" title={site.name} href="/rss.xml" />
  </head>
  <body>
    <slot />
    <script>
      import { initMotion } from '@/scripts/motion';
      initMotion();
    </script>
  </body>
</html>
```

- [ ] **Step 3: Create a temporary `src/scripts/motion.ts` stub so the import resolves**

```ts
export function initMotion(): void {
  // Implemented in Phase 3.
}
```

- [ ] **Step 4: Add a minimal `src/pages/index.astro` to exercise the layout**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---
<BaseLayout>
  <main class="container"><h1>Saeed Ghorbani</h1></main>
</BaseLayout>
```

- [ ] **Step 5: Verify build + typecheck**

Run: `npm run build && npm run check`
Expected: both succeed; rendered page has the title and styles.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add BaseLayout with SEO meta and site config"
```

---

## Phase 2 — Content modeling & migration

### Task 2.1: Define zod schemas (TDD)

**Files:**
- Create: `src/schemas.ts`, `src/schemas.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/schemas.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { publicationSchema, newsSchema } from '@/schemas';

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/schemas.test.ts`
Expected: FAIL — cannot resolve `@/schemas`.

- [ ] **Step 3: Write `src/schemas.ts`**

```ts
import { z } from 'astro:content';

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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/schemas.test.ts`
Expected: PASS (4 assertions).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add content zod schemas with tests"
```

### Task 2.2: Wire Astro content collections

**Files:**
- Create: `src/content.config.ts`

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
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
```

Note: the `file()` loader expects each YAML entry to have an `id`. The data files in Task 2.3 are arrays of objects each with a unique `id` field.

- [ ] **Step 2: Verify typecheck**

Run: `npm run check`
Expected: success (collections compile; data files added next task).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: wire blog/publications/projects/news collections"
```

### Task 2.3: Migrate content from the existing Jekyll repo

**Files:**
- Create: `src/data/publications.yaml`, `src/data/projects.yaml`, `src/data/news.yaml`, `src/content/blog/*.md`, `public/images/*`, `public/cv.pdf`

- [ ] **Step 1: Clone the existing site into a scratch dir (outside the repo)**

```bash
git clone --depth 1 https://github.com/saeed1262/saeed1262.github.io /tmp/al-folio-src
ls /tmp/al-folio-src/_posts /tmp/al-folio-src/_bibliography /tmp/al-folio-src/_news /tmp/al-folio-src/_projects
```
Expected: lists existing posts, `papers.bib`, news, and project markdown.

- [ ] **Step 2: Copy assets (headshot, CV, images)**

```bash
mkdir -p public/images
cp /tmp/al-folio-src/assets/img/prof_pic* public/images/ 2>/dev/null || true
find /tmp/al-folio-src/assets -iname '*.pdf' -exec cp {} public/cv.pdf \; 2>/dev/null || true
# copy publication/project images referenced by content
cp -r /tmp/al-folio-src/assets/img/publication_preview public/images/ 2>/dev/null || true
```
Expected: `public/images/` populated; `public/cv.pdf` present (verify a CV PDF exists; if named differently, copy it explicitly).

- [ ] **Step 3: Author `src/data/publications.yaml`** from `papers.bib`

Translate each entry in `/tmp/al-folio-src/_bibliography/papers.bib` into YAML. Use the known six papers as the baseline (verify/extend against the .bib):
```yaml
- id: upose3d
  title: "UPose3D: Uncertainty-Aware 3D Human Pose Estimation"
  authors: "S. Ghorbani et al."
  venue: "ECCV"
  year: 2024
  abstract: "Multi-view 3D human pose estimation using uncertainty and temporal cues."
  links: {}
- id: skelformer
  title: "SkelFormer: Markerless 3D Pose and Shape Estimation"
  authors: "S. Ghorbani et al."
  venue: "ECCVW"
  year: 2024
  links: {}
- id: zeroeggs
  title: "ZeroEGGS: Zero-shot Example-based Gesture Generation from Speech"
  authors: "S. Ghorbani et al."
  venue: "Computer Graphics Forum"
  year: 2023
  abstract: "Speech-driven gesture generation with zero-shot style control by example."
  links: {}
- id: movi
  title: "MoVi: A Large Multipurpose Human Motion and Video Dataset"
  authors: "S. Ghorbani et al."
  venue: "PLOS ONE"
  year: 2021
  links: {}
- id: probabilistic-motion
  title: "Probabilistic Character Motion Synthesis using a Hierarchical Deep Latent Variable Model"
  authors: "S. Ghorbani et al."
  venue: "Computer Graphics Forum"
  year: 2020
  links: {}
- id: auto-labelling
  title: "Auto-labelling of Markers in Optical Motion Capture by Permutation Learning"
  authors: "S. Ghorbani et al."
  venue: "Computer Graphics International"
  year: 2019
  award: "Best Paper Award"
  links: {}
```
Fill exact author lists, abstracts, and `links` (pdf/code/project) from the `.bib` and `dimensions`/`html` fields.

- [ ] **Step 4: Author `src/data/news.yaml`** from `_news/`

```yaml
- id: weta-2026
  date: "2026-02-01"
  text: "Joined Wētā FX as a Senior Research Scientist."
- id: amazon-2025
  date: "2025-01-01"
  text: "Joined Amazon Games as a Research Scientist."
- id: ubisoft
  date: "2021-01-01"
  text: "R&D Scientist at Ubisoft La Forge."
- id: phd
  date: "2024-01-01"
  text: "Completed PhD at York University (VISTA & CVR trainee)."
```
Adjust dates/text to match the `_news/` entries exactly.

- [ ] **Step 5: Author `src/data/projects.yaml`** from `_projects/`

Translate each `_projects/*.md` front-matter into one entry:
```yaml
- id: example-project
  title: "Project Title"
  description: "One-line description."
  image: "/images/project-example.png"
  url: "https://example.com"
  tags: ["computer vision"]
```
Create one entry per existing project (copy referenced images into `public/images/`).

- [ ] **Step 6: Port blog posts to `src/content/blog/`**

For each file in `/tmp/al-folio-src/_posts/*.md`:
```bash
mkdir -p src/content/blog
# For each post: copy, rename to <slug>.md, and convert front-matter:
#   Jekyll:  date: 2021-03-01 -> Astro: date: 2021-03-01
#   keep title; add description if present; map any layout/categories out.
```
Each ported file must have front-matter matching the `blog` schema:
```md
---
title: "Post title"
date: 2021-03-01
description: "Short summary."
tags: ["note"]
---

Post body in markdown. Fix image paths to /images/...
```
If there are zero existing posts, create `src/content/blog/.gitkeep` and skip — the blog index handles emptiness in Task 6.1.

- [ ] **Step 7: Validate all migrated content parses**

Run: `npm run build`
Expected: build succeeds; any schema mismatch fails the build with the offending file/field. Fix until green.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: migrate publications, news, projects, blog, and assets"
```

---

## Phase 3 — Cinematic motion engine

### Task 3.1: Date formatting util (TDD)

**Files:**
- Create: `src/utils/format.ts`, `src/utils/format.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatYear } from '@/utils/format';

describe('formatDate', () => {
  it('formats an ISO date as "Mon YYYY"', () => {
    expect(formatDate('2026-02-01')).toBe('Feb 2026');
  });
  it('accepts a Date object', () => {
    expect(formatDate(new Date('2021-03-15'))).toBe('Mar 2021');
  });
});

describe('formatYear', () => {
  it('returns the year', () => {
    expect(formatYear('2024-09-01')).toBe(2024);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/utils/format.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/format.ts`**

```ts
export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function formatYear(input: string | Date): number {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.getUTCFullYear();
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/utils/format.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add date formatting utilities with tests"
```

### Task 3.2: Motion engine (Lenis + GSAP, reduced-motion aware)

**Files:**
- Modify: `src/scripts/motion.ts` (replace stub)

- [ ] **Step 1: Implement `src/scripts/motion.ts`**

```ts
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMotion(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal elements regardless; with reduced motion we just show them immediately.
  const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (prefersReduced) {
    revealEls.forEach((el) => (el.style.opacity = '1'));
    return;
  }

  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);

  revealEls.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      },
    );
  });

  // Parallax for any [data-parallax] element.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    gsap.to(el, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}
```

- [ ] **Step 2: Add a `Reveal` wrapper component `src/components/ui/Reveal.astro`**

```astro
---
interface Props { as?: string; class?: string; }
const { as = 'div', class: className } = Astro.props;
const Tag = as;
---
<Tag data-reveal class={className} style="opacity:0"><slot /></Tag>
```

- [ ] **Step 3: Verify build (the script is bundled by Astro)**

Run: `npm run build`
Expected: success; `dist/` includes a bundled script chunk for motion.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open the page, confirm: smooth scrolling feels momentum-based; toggling OS "Reduce Motion" makes content appear instantly with native scroll. Document result.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Lenis + GSAP motion engine with reduced-motion fallback"
```

---

## Phase 4 — WebGL particle hero

### Task 4.1: ParticleField class

**Files:**
- Create: `src/scripts/hero/particles.ts`

- [ ] **Step 1: Implement `src/scripts/hero/particles.ts`**

A self-contained Three.js class: a drifting point cloud animated by a noise-like flow in the vertex shader, tinted with the accent gradient, gently reacting to pointer position. Exposes `start()`, `stop()`, and `dispose()`.
```ts
import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute,
  ShaderMaterial, Points, Color, AdditiveBlending, Vector2,
} from 'three';

export class ParticleField {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private points!: Points;
  private material!: ShaderMaterial;
  private raf = 0;
  private pointer = new Vector2(0, 0);
  private clockStart = 0;

  constructor(private canvas: HTMLCanvasElement, private count = 4000) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera = new PerspectiveCamera(60, 1, 0.1, 100);
    this.camera.position.z = 6;
    this.build();
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', this.onPointer);
  }

  private build() {
    const positions = new Float32Array(this.count * 3);
    const seeds = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      seeds[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('seed', new BufferAttribute(seeds, 1));

    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: this.pointer },
        uFrom: { value: new Color('#22d3ee') },
        uTo: { value: new Color('#818cf8') },
      },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform vec2 uPointer; attribute float seed; varying float vMix;
        void main() {
          vec3 p = position;
          float t = uTime * 0.15 + seed * 6.2831;
          p.x += sin(t + p.y * 0.4) * 0.4;
          p.y += cos(t + p.x * 0.4) * 0.4;
          p.xy += uPointer * (0.4 + seed * 0.6);
          vMix = seed;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (12.0 / -mv.z) * (0.5 + seed);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uFrom; uniform vec3 uTo; varying float vMix;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = smoothstep(0.5, 0.0, length(c));
          gl_FragColor = vec4(mix(uFrom, uTo, vMix), d * 0.7);
        }
      `,
    });
    this.points = new Points(geo, this.material);
    this.scene.add(this.points);
  }

  private resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private onPointer = (e: PointerEvent) => {
    this.pointer.set((e.clientX / window.innerWidth - 0.5) * 2, -(e.clientY / window.innerHeight - 0.5) * 2);
  };

  private loop = (now: number) => {
    if (!this.clockStart) this.clockStart = now;
    this.material.uniforms.uTime.value = (now - this.clockStart) / 1000;
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  };

  start() { if (!this.raf) this.raf = requestAnimationFrame(this.loop); }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
  dispose() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointer);
    this.points.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Three.js latent-space particle field"
```

### Task 4.2: Hero component with deferred/lazy WebGL + fallback

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Write `src/components/Hero.astro`**

The static gradient poster is always rendered (the fallback). The WebGL canvas lazy-loads Three.js only on capable, non-reduced-motion, desktop-ish clients via `IntersectionObserver` + dynamic import.
```astro
---
import { site } from '@/data/site';
---
<section class="hero" aria-label="Intro">
  <div class="hero__poster" aria-hidden="true"></div>
  <canvas id="hero-canvas" class="hero__canvas" aria-hidden="true"></canvas>
  <div class="hero__content container">
    <p class="hero__eyebrow">{site.role}</p>
    <h1 class="hero__title">{site.name}</h1>
    <p class="hero__tagline accent-text">Machine learning, in motion.</p>
    <a class="hero__cue" href="#about">Scroll ↓</a>
  </div>
</section>

<style>
  .hero { position: relative; min-height: 100svh; display: grid; place-items: center; overflow: hidden; background: var(--bg-deep); }
  .hero__poster, .hero__canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .hero__poster { background: radial-gradient(60% 60% at 50% 40%, rgba(129,140,248,0.25), transparent 70%), radial-gradient(50% 50% at 70% 70%, rgba(34,211,238,0.18), transparent 70%); }
  .hero__canvas { opacity: 0; transition: opacity 1.2s var(--ease-out); }
  .hero__canvas.is-on { opacity: 1; }
  .hero__content { position: relative; text-align: center; }
  .hero__eyebrow { color: var(--text-muted); letter-spacing: 0.2em; text-transform: uppercase; font-size: var(--step--1); }
  .hero__title { font-size: var(--step-5); font-weight: 700; }
  .hero__tagline { font-size: var(--step-2); margin-top: var(--space-xs); }
  .hero__cue { display: inline-block; margin-top: var(--space-md); color: var(--text-muted); }
  @media (prefers-reduced-motion: reduce) { .hero__canvas { display: none; } }
</style>

<script>
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 768px)').matches;
  if (canvas && !reduced && !small) {
    const io = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const { ParticleField } = await import('@/scripts/hero/particles');
      const field = new ParticleField(canvas);
      field.start();
      canvas.classList.add('is-on');
    });
    io.observe(canvas);
  }
</script>
```

- [ ] **Step 2: Use the hero in `src/pages/index.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
---
<BaseLayout>
  <main>
    <Hero />
    <section id="about" class="container" style="min-height:60vh"><h2>About</h2></section>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Verify build + manual check**

Run: `npm run build` then `npm run dev`.
Expected: build OK. On desktop the canvas fades in with drifting particles reacting to the mouse; on mobile width and with Reduce Motion the static gradient poster shows and Three.js is never downloaded (verify in the Network tab).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: cinematic hero with lazy WebGL and static fallback"
```

---

## Phase 5 — Home page sections

### Task 5.1: UI primitives (SectionHeading, Button, Card)

**Files:**
- Create: `src/components/ui/SectionHeading.astro`, `src/components/ui/Button.astro`, `src/components/ui/Card.astro`

- [ ] **Step 1: Write `src/components/ui/SectionHeading.astro`**

```astro
---
interface Props { kicker?: string; title: string; }
const { kicker, title } = Astro.props;
---
<header class="sh">
  {kicker && <p class="sh__kicker">{kicker}</p>}
  <h2 class="sh__title">{title}</h2>
  <style>
    .sh { margin-bottom: var(--space-lg); }
    .sh__kicker { color: var(--accent-from); letter-spacing: 0.18em; text-transform: uppercase; font-size: var(--step--1); }
    .sh__title { font-size: var(--step-3); }
  </style>
</header>
```

- [ ] **Step 2: Write `src/components/ui/Button.astro`**

```astro
---
interface Props { href: string; variant?: 'solid' | 'ghost'; }
const { href, variant = 'solid' } = Astro.props;
const external = href.startsWith('http');
---
<a class:list={['btn', `btn--${variant}`]} href={href} {...external ? { target: '_blank', rel: 'noopener' } : {}}>
  <slot />
  <style>
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.2rem; border-radius: 999px; font-weight: 500; transition: transform 0.2s var(--ease-out), background 0.2s; }
    .btn--solid { background: var(--accent-gradient); color: #07080c; }
    .btn--ghost { border: 1px solid var(--border); color: var(--text); }
    .btn:hover { transform: translateY(-2px); }
  </style>
</a>
```

- [ ] **Step 3: Write `src/components/ui/Card.astro`**

```astro
---
interface Props { class?: string; }
const { class: className } = Astro.props;
---
<article class:list={['card', className]}>
  <slot />
  <style>
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: var(--space-md); transition: border-color 0.3s, transform 0.3s var(--ease-out); }
    .card:hover { border-color: color-mix(in srgb, var(--accent-from) 50%, var(--border)); transform: translateY(-4px); }
  </style>
</article>
```

- [ ] **Step 4: Build to verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add UI primitives (heading, button, card)"
```

### Task 5.2: About section

**Files:**
- Create: `src/components/sections/About.astro`

- [ ] **Step 1: Write `src/components/sections/About.astro`**

```astro
---
import { site } from '@/data/site';
import Reveal from '@/components/ui/Reveal.astro';
import SectionHeading from '@/components/ui/SectionHeading.astro';
---
<section id="about" class="about container">
  <SectionHeading kicker="About" title="Hello, I'm Saeed." />
  <div class="about__grid">
    <Reveal class="about__bio">
      <p>
        I'm a machine learning engineer. My research background spans deep learning,
        computer vision, and human motion modeling — including probabilistic models,
        3D pose estimation, and gesture synthesis.
      </p>
      <p>Previously at Wētā FX, Amazon Games, and Ubisoft La Forge. PhD from York University.</p>
    </Reveal>
    <Reveal class="about__photo">
      <img src="/images/prof_pic.jpg" alt="Saeed Ghorbani" width="320" height="320" data-parallax loading="lazy" />
    </Reveal>
  </div>
  <style>
    .about { padding-block: var(--space-xl); }
    .about__grid { display: grid; gap: var(--space-lg); grid-template-columns: 1.4fr 1fr; align-items: center; }
    .about__bio p + p { margin-top: var(--space-sm); color: var(--text-muted); }
    .about__photo img { border-radius: 20px; }
    @media (max-width: 768px) { .about__grid { grid-template-columns: 1fr; } }
  </style>
</section>
```
Note: confirm the headshot filename copied in Task 2.3 (`prof_pic.jpg`); adjust `src` if different.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add About section"
```

### Task 5.3: Timeline section

**Files:**
- Create: `src/components/sections/Timeline.astro`

- [ ] **Step 1: Write `src/components/sections/Timeline.astro`**

```astro
---
import { getCollection } from 'astro:content';
import { formatDate } from '@/utils/format';
import Reveal from '@/components/ui/Reveal.astro';
import SectionHeading from '@/components/ui/SectionHeading.astro';

const items = (await getCollection('news')).sort(
  (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
);
---
<section id="news" class="timeline container">
  <SectionHeading kicker="Timeline" title="News & milestones" />
  <ol class="timeline__list">
    {items.map((item) => (
      <Reveal as="li" class="timeline__item">
        <time class="timeline__date">{formatDate(item.data.date)}</time>
        <p class="timeline__text">{item.data.text}</p>
      </Reveal>
    ))}
  </ol>
  <style>
    .timeline { padding-block: var(--space-xl); }
    .timeline__list { list-style: none; padding: 0; border-left: 1px solid var(--border); }
    .timeline__item { padding: 0 0 var(--space-md) var(--space-md); position: relative; }
    .timeline__item::before { content: ''; position: absolute; left: -5px; top: 6px; width: 9px; height: 9px; border-radius: 50%; background: var(--accent-gradient); }
    .timeline__date { color: var(--accent-from); font-size: var(--step--1); }
    .timeline__text { color: var(--text); }
  </style>
</section>
```

- [ ] **Step 2: Build to verify it reads the `news` collection**

Run: `npm run build`
Expected: success; timeline renders sorted newest-first.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add timeline/news section"
```

### Task 5.4: Publications section (component test + build)

**Files:**
- Create: `src/components/sections/Publications.astro`, `src/components/sections/Publications.test.ts`

- [ ] **Step 1: Write the failing component test**

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Card from '@/components/ui/Card.astro';

describe('Card', () => {
  it('renders slotted content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Card, { slots: { default: 'Paper title' } });
    expect(html).toContain('Paper title');
    expect(html).toContain('class="card');
  });
});
```

- [ ] **Step 2: Run to verify it fails (or passes once Card exists)**

Run: `npx vitest run src/components/sections/Publications.test.ts`
Expected: PASS (Card was built in Task 5.1) — this test guards the container API works for components. If it fails to import, fix the alias/config before continuing.

- [ ] **Step 3: Write `src/components/sections/Publications.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Reveal from '@/components/ui/Reveal.astro';
import Card from '@/components/ui/Card.astro';
import SectionHeading from '@/components/ui/SectionHeading.astro';

const pubs = (await getCollection('publications')).sort((a, b) => b.data.year - a.data.year);
---
<section id="publications" class="pubs container">
  <SectionHeading kicker="Research" title="Selected publications" />
  <div class="pubs__list">
    {pubs.map((p) => (
      <Reveal>
        <Card class="pub">
          <div class="pub__head">
            <h3 class="pub__title">{p.data.title}</h3>
            {p.data.award && <span class="pub__award">{p.data.award}</span>}
          </div>
          <p class="pub__meta">{p.data.authors} · {p.data.venue} {p.data.year}</p>
          {p.data.abstract && <p class="pub__abstract">{p.data.abstract}</p>}
          <div class="pub__links">
            {p.data.links.pdf && <a href={p.data.links.pdf} target="_blank" rel="noopener">PDF</a>}
            {p.data.links.code && <a href={p.data.links.code} target="_blank" rel="noopener">Code</a>}
            {p.data.links.project && <a href={p.data.links.project} target="_blank" rel="noopener">Project</a>}
          </div>
        </Card>
      </Reveal>
    ))}
  </div>
  <style>
    .pubs { padding-block: var(--space-xl); }
    .pubs__list { display: grid; gap: var(--space-sm); }
    .pub__head { display: flex; justify-content: space-between; gap: var(--space-sm); align-items: baseline; }
    .pub__title { font-size: var(--step-1); }
    .pub__award { color: var(--accent-from); font-size: var(--step--1); white-space: nowrap; }
    .pub__meta { color: var(--text-muted); font-size: var(--step--1); margin-top: 0.25rem; }
    .pub__abstract { margin-top: var(--space-xs); color: var(--text-muted); }
    .pub__links { display: flex; gap: var(--space-sm); margin-top: var(--space-sm); }
    .pub__links a { color: var(--accent-from); font-size: var(--step--1); }
  </style>
</section>
```

- [ ] **Step 4: Run test + build**

Run: `npx vitest run && npm run build`
Expected: tests PASS; build renders all publications sorted by year desc.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add publications section with component test"
```

### Task 5.5: Projects section

**Files:**
- Create: `src/components/sections/Projects.astro`

- [ ] **Step 1: Write `src/components/sections/Projects.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Reveal from '@/components/ui/Reveal.astro';
import Card from '@/components/ui/Card.astro';
import SectionHeading from '@/components/ui/SectionHeading.astro';

const projects = await getCollection('projects');
---
<section id="projects" class="projects container">
  <SectionHeading kicker="Work" title="Projects" />
  <div class="projects__grid">
    {projects.map((proj) => (
      <Reveal>
        <Card class="project">
          {proj.data.image && <img src={proj.data.image} alt={proj.data.title} loading="lazy" width="600" height="340" />}
          <h3>{proj.data.title}</h3>
          <p>{proj.data.description}</p>
          {proj.data.url && <a href={proj.data.url} target="_blank" rel="noopener">View →</a>}
        </Card>
      </Reveal>
    ))}
  </div>
  <style>
    .projects { padding-block: var(--space-xl); }
    .projects__grid { display: grid; gap: var(--space-md); grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .project img { border-radius: 12px; margin-bottom: var(--space-sm); object-fit: cover; }
    .project p { color: var(--text-muted); margin-block: 0.5rem; }
    .project a { color: var(--accent-from); }
  </style>
</section>
```

- [ ] **Step 2: Build to verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add projects section"
```

### Task 5.6: BlogTeaser, SiteHeader, SiteFooter, and compose the home page

**Files:**
- Create: `src/components/sections/BlogTeaser.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/ui/Cursor.astro`
- Modify: `src/pages/index.astro`, `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write `src/components/sections/BlogTeaser.astro`**

```astro
---
import { getCollection } from 'astro:content';
import { formatDate } from '@/utils/format';
import Reveal from '@/components/ui/Reveal.astro';
import SectionHeading from '@/components/ui/SectionHeading.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
---
{posts.length > 0 && (
  <section id="blog" class="blog container">
    <SectionHeading kicker="Writing" title="From the blog" />
    <ul class="blog__list">
      {posts.map((post) => (
        <Reveal as="li">
          <a href={`/blog/${post.id}/`} class="blog__item">
            <time>{formatDate(post.data.date)}</time>
            <h3>{post.data.title}</h3>
            {post.data.description && <p>{post.data.description}</p>}
          </a>
        </Reveal>
      ))}
    </ul>
    <a href="/blog/" class="blog__all">All posts →</a>
    <style>
      .blog { padding-block: var(--space-xl); }
      .blog__list { list-style: none; padding: 0; display: grid; gap: var(--space-md); }
      .blog__item time { color: var(--text-muted); font-size: var(--step--1); }
      .blog__item h3 { font-size: var(--step-1); margin-top: 0.25rem; }
      .blog__item p { color: var(--text-muted); margin-top: 0.25rem; }
      .blog__all { color: var(--accent-from); display: inline-block; margin-top: var(--space-md); }
    </style>
  </section>
)}
```

- [ ] **Step 2: Write `src/components/SiteHeader.astro`**

```astro
---
import { site } from '@/data/site';
---
<header class="nav">
  <a href="/" class="nav__brand">{site.name}</a>
  <nav class="nav__links">
    <a href="/#about">About</a>
    <a href="/#publications">Publications</a>
    <a href="/#projects">Projects</a>
    <a href="/blog/">Blog</a>
    <a href="/cv/">CV</a>
  </nav>
  <style>
    .nav { position: fixed; top: 0; inset-inline: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) var(--space-md); backdrop-filter: blur(10px); background: color-mix(in srgb, var(--bg) 70%, transparent); border-bottom: 1px solid var(--border); }
    .nav__brand { font-family: var(--font-display); font-weight: 600; }
    .nav__links { display: flex; gap: var(--space-md); font-size: var(--step--1); }
    @media (max-width: 640px) { .nav__links { gap: var(--space-sm); } }
  </style>
</header>
```

- [ ] **Step 3: Write `src/components/SiteFooter.astro`**

```astro
---
import { site } from '@/data/site';
const links = [
  ['GitHub', site.links.github], ['LinkedIn', site.links.linkedin],
  ['Twitter', site.links.twitter], ['Scholar', site.links.scholar],
  ['Email', `mailto:${site.email}`],
];
---
<footer class="footer container">
  <p>© {site.name}</p>
  <nav class="footer__links">
    {links.map(([label, href]) => <a href={href} target="_blank" rel="noopener">{label}</a>)}
  </nav>
  <style>
    .footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-sm); padding-block: var(--space-lg); color: var(--text-muted); border-top: 1px solid var(--border); }
    .footer__links { display: flex; gap: var(--space-md); }
    .footer__links a:hover { color: var(--text); }
  </style>
</footer>
```

- [ ] **Step 4: Write `src/components/ui/Cursor.astro`** (desktop-only animated cursor)

```astro
<div id="cursor" class="cursor" aria-hidden="true"></div>
<style>
  .cursor { position: fixed; top: 0; left: 0; width: 18px; height: 18px; border: 1px solid var(--accent-from); border-radius: 50%; pointer-events: none; z-index: 50; transform: translate(-50%, -50%); transition: width 0.2s, height 0.2s; mix-blend-mode: difference; }
  @media (max-width: 768px), (prefers-reduced-motion: reduce) { .cursor { display: none; } }
</style>
<script>
  const cursor = document.getElementById('cursor');
  if (cursor && !window.matchMedia('(max-width: 768px)').matches) {
    window.addEventListener('pointermove', (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
  }
</script>
```

- [ ] **Step 5: Add header/footer/cursor to `BaseLayout.astro`**

In `src/layouts/BaseLayout.astro`, import and place them around the slot:
```astro
---
import '@/styles/tokens.css';
import '@/styles/global.css';
import { site } from '@/data/site';
import SiteHeader from '@/components/SiteHeader.astro';
import SiteFooter from '@/components/SiteFooter.astro';
import Cursor from '@/components/ui/Cursor.astro';
// ...existing Props + frontmatter unchanged...
---
<!-- inside <body>, replace the bare <slot /> with: -->
<Cursor />
<SiteHeader />
<slot />
<SiteFooter />
<script>
  import { initMotion } from '@/scripts/motion';
  initMotion();
</script>
```

- [ ] **Step 6: Compose the full home page `src/pages/index.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import About from '@/components/sections/About.astro';
import Timeline from '@/components/sections/Timeline.astro';
import Publications from '@/components/sections/Publications.astro';
import Projects from '@/components/sections/Projects.astro';
import BlogTeaser from '@/components/sections/BlogTeaser.astro';
---
<BaseLayout>
  <main>
    <Hero />
    <About />
    <Timeline />
    <Publications />
    <Projects />
    <BlogTeaser />
  </main>
</BaseLayout>
```

- [ ] **Step 7: Build + manual review of the full home page**

Run: `npm run build && npm run dev`
Expected: full cinematic home renders top-to-bottom; sections reveal on scroll; nav is fixed; footer links work.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: compose cinematic home page with all sections"
```

---

## Phase 6 — Inner pages

### Task 6.1: Blog index + post pages

**Files:**
- Create: `src/layouts/PostLayout.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Write `src/layouts/PostLayout.astro`** (calm, readable)

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { formatDate } from '@/utils/format';
interface Props { title: string; date: Date; description?: string; }
const { title, date, description } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <article class="post container">
    <a href="/blog/" class="post__back">← Blog</a>
    <h1>{title}</h1>
    <time class="post__date">{formatDate(date)}</time>
    <div class="post__body"><slot /></div>
  </article>
  <style>
    .post { padding-block: var(--space-xl); max-width: 44rem; }
    .post__back { color: var(--accent-from); font-size: var(--step--1); }
    .post h1 { font-size: var(--step-4); margin-top: var(--space-sm); }
    .post__date { color: var(--text-muted); }
    .post__body { margin-top: var(--space-lg); }
    .post__body :global(p) { margin-bottom: var(--space-sm); }
    .post__body :global(h2) { margin-block: var(--space-md) var(--space-sm); }
    .post__body :global(img) { border-radius: 12px; margin-block: var(--space-md); }
    .post__body :global(a) { color: var(--accent-from); text-decoration: underline; }
  </style>
</BaseLayout>
```

- [ ] **Step 2: Write `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
import { formatDate } from '@/utils/format';
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="Blog">
  <main class="bloglist container">
    <h1>Blog</h1>
    {posts.length === 0 && <p>No posts yet.</p>}
    <ul>
      {posts.map((post) => (
        <li>
          <a href={`/blog/${post.id}/`}>
            <time>{formatDate(post.data.date)}</time>
            <span>{post.data.title}</span>
          </a>
        </li>
      ))}
    </ul>
  </main>
  <style>
    .bloglist { padding-block: var(--space-xl); max-width: 48rem; }
    .bloglist h1 { font-size: var(--step-4); margin-bottom: var(--space-lg); }
    .bloglist ul { list-style: none; padding: 0; display: grid; gap: var(--space-sm); }
    .bloglist a { display: flex; gap: var(--space-md); align-items: baseline; padding: var(--space-sm) 0; border-bottom: 1px solid var(--border); }
    .bloglist time { color: var(--text-muted); font-size: var(--step--1); min-width: 6rem; }
  </style>
</BaseLayout>
```

- [ ] **Step 3: Write `src/pages/blog/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '@/layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await render(post);
---
<PostLayout title={post.data.title} date={post.data.date} description={post.data.description}>
  <Content />
</PostLayout>
```

- [ ] **Step 4: Build + verify post routing**

Run: `npm run build`
Expected: a page generated per post at `/blog/<slug>/`; blog index lists them. If no posts exist, index shows "No posts yet." and build still succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add blog index and post pages"
```

### Task 6.2: Publications page, CV page, 404

**Files:**
- Create: `src/pages/publications.astro`, `src/pages/cv.astro`, `src/pages/404.astro`

- [ ] **Step 1: Write `src/pages/publications.astro`** (reuses the section)

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Publications from '@/components/sections/Publications.astro';
---
<BaseLayout title="Publications">
  <main style="padding-top: var(--space-xl)">
    <Publications />
  </main>
</BaseLayout>
```

- [ ] **Step 2: Write `src/pages/cv.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Button from '@/components/ui/Button.astro';
---
<BaseLayout title="CV">
  <main class="cv container">
    <h1>Curriculum Vitae</h1>
    <p>Download the full CV as a PDF.</p>
    <Button href="/cv.pdf" variant="solid">Download CV (PDF)</Button>
    <style>
      .cv { padding-block: var(--space-xl); display: grid; gap: var(--space-md); }
      .cv h1 { font-size: var(--step-4); }
    </style>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Write `src/pages/404.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Button from '@/components/ui/Button.astro';
---
<BaseLayout title="Not found">
  <main class="nf container">
    <h1 class="accent-text">404</h1>
    <p>This page drifted out of the latent space.</p>
    <Button href="/" variant="ghost">Back home</Button>
    <style>
      .nf { min-height: 70vh; display: grid; place-content: center; text-align: center; gap: var(--space-md); }
      .nf h1 { font-size: var(--step-5); }
    </style>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Build to verify all pages**

Run: `npm run build`
Expected: `/publications/`, `/cv/`, and `404.html` are emitted.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add publications, CV, and 404 pages"
```

---

## Phase 7 — SEO, RSS, OG

### Task 7.1: RSS feed

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Write `src/pages/rss.xml.ts`**

```ts
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
```

- [ ] **Step 2: Build + verify the feed**

Run: `npm run build`
Expected: `dist/rss.xml` exists and is valid XML referencing the posts (empty `<item>` set is fine if no posts).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add RSS feed"
```

### Task 7.2: Default OG image

**Files:**
- Create: `public/images/og-default.png`

- [ ] **Step 1: Add a 1200×630 PNG**

Create a simple dark OG card (name + role on the gradient) sized 1200×630 and save it as `public/images/og-default.png`. (Can be exported from a design tool or generated; must exist so `BaseLayout`'s `og:image` resolves.)

- [ ] **Step 2: Verify the meta tag resolves**

Run: `npm run build`, inspect `dist/index.html`.
Expected: `og:image` points at `https://saeed1262.github.io/images/og-default.png`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add default Open Graph image"
```

---

## Phase 8 — Deployment

### Task 8.1: GitHub Actions → GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Document the one-time Pages setting**

In the repo Settings → Pages, set **Source = GitHub Actions**. (Manual step; note it in the PR description.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: deploy to GitHub Pages via Actions"
```

---

## Phase 9 — Quality gates

### Task 9.1: Accessibility & reduced-motion pass

**Files:** none (verification task)

- [ ] **Step 1: Keyboard + reduced-motion check**

Run `npm run dev`. Verify: tab order reaches all links with visible focus rings; enabling OS Reduce Motion disables Lenis/particle field and reveals content instantly; color contrast of `--text-muted` on `--bg` is ≥ 4.5:1 (adjust token if not).
Expected: all pass; record findings.

- [ ] **Step 2: Commit any token/markup fixes**

```bash
git add -A
git commit -m "fix: accessibility and reduced-motion adjustments"
```

### Task 9.2: Lighthouse + content-parity audit

**Files:** none (verification task)

- [ ] **Step 1: Run Lighthouse on the production build**

```bash
npm run build && npm run preview &
npx lighthouse http://localhost:4321 --only-categories=performance,accessibility,seo,best-practices --chrome-flags="--headless" --output=json --output-path=./lighthouse.json
```
Expected: performance ≥ 95 (desktop), accessibility ≥ 95, SEO ≥ 95. If short, address the flagged items (lazy-load, image sizes, contrast) and re-run.

- [ ] **Step 2: Content-parity checklist against the old site**

Confirm every item exists on the new site: all 6 publications (titles, venues, links, the Best Paper award), all news/timeline entries, all projects, every blog post, social links (GitHub, LinkedIn, Twitter, Scholar), email, CV PDF, headshot.
Expected: 100% parity; fix any gaps in the YAML/markdown.

- [ ] **Step 3: Final cross-browser manual check**

Verify the home page and one blog post in current Chrome, Safari, and Firefox at desktop + mobile widths.
Expected: no layout breakage; hero fallback correct on mobile.

- [ ] **Step 4: Clean up and commit**

```bash
rm -f lighthouse.json
git add -A
git commit -m "chore: quality-gate fixes (lighthouse, parity, cross-browser)"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** Cinematic scroll story → Phases 3–5; Astro/static/GitHub Pages → Tasks 0.1, 8.1; dark palette + Clash/Inter + accent → Tasks 1.1–1.2; latent-space particle hero + fallback → Phase 4; Lenis+GSAP + reduced-motion → Task 3.2; cinematic home + calmer inner pages → Phase 5 vs Phase 6; content as YAML + markdown blog → Phase 2; keep-everything migration → Task 2.3 + 9.2 parity; SEO/RSS/OG/sitemap → Task 0.1 (sitemap), Phase 7; quality budgets → Phase 9. All spec sections map to tasks.

**Placeholder scan:** No "TBD/TODO/handle edge cases" in steps. Two content values are explicitly marked to fill from source during migration (Scholar id, exact `.bib` fields) — these are data-entry items with a named source, not code placeholders.

**Type consistency:** `publicationSchema`/`projectSchema`/`newsSchema` defined in `src/schemas.ts` (Task 2.1) are the same names imported in `src/content.config.ts` (Task 2.2). `formatDate`/`formatYear` defined in Task 3.1 match usages in Tasks 5.3, 5.6, 6.1, 6.2. `ParticleField` (Task 4.1) matches the dynamic import in Task 4.2. `initMotion` stub (Task 1.3) → real impl (Task 3.2) → call site (BaseLayout). `Reveal`, `Card`, `SectionHeading`, `Button` defined before first use.
