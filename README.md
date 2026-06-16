# Saeed Ghorbani — Personal Site

Saeed Ghorbani's personal website: a cinematic, motion-driven portfolio built with
Astro. It showcases research, publications, and writing with a 3D hero scene and
smooth scroll-based animation.

## Tech stack

- [Astro 6](https://astro.build) — static site framework
- [Three.js](https://threejs.org) — 3D hero scene
- [GSAP](https://gsap.com) + [Lenis](https://lenis.darkroom.engineering) — animation and smooth scroll
- [Fontsource](https://fontsource.org) — self-hosted Inter and Space Grotesk fonts

## Development

```sh
npm install      # install dependencies
npm run dev      # start dev server at localhost:4321
npm run build    # build production site to ./dist/
npm run check    # astro check (type + content checks)
npm test         # run the vitest suite
```

## Content model

- **Blog posts** — markdown in `src/content/blog/`
- **Structured data** (news, publications, etc.) — YAML in `src/data/`
- **CV / resume** — `src/data/cv.ts`
- **Site metadata and social links** — `src/data/site.ts`

## OG image

The social share image is generated from a script. Regenerate it with:

```sh
node scripts/gen-og.mjs
```

## Deployment

Deploys to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) on
every push to `main`. The workflow runs `npm run check` and the test suite as a
quality gate before building and uploading.

One-time setup: in the repo's **Settings → Pages**, set **Source** to
**GitHub Actions**.
