# Personal Site — Cinematic Redesign (Design Spec)

**Date:** 2026-06-16
**Owner:** Saeed Ghorbani
**Status:** Approved (design) — pending implementation plan

---

## 1. Summary

Rebuild Saeed Ghorbani's personal website from a minimal Jekyll/al-folio academic
template into a **top-tier, cinematic scroll-driven experience**, built in **Astro**
and deployed as a static site to **GitHub Pages** (keeping `saeed1262.github.io`).

The site keeps **all existing content** (about, news/timeline, publications, projects,
blog, CV, social links) — this is a *restyle and re-platform*, not a content rewrite.
The aesthetic is **dark, premium, ML-flavored**, with an abstract generative hero.
Repositioning content/copy toward "ML engineer" framing is explicitly **out of scope
for this round** (decided: "keep everything, restyle only").

## 2. Goals & non-goals

### Goals
- A genuinely top-tier, "wow" landing experience that loads fast and feels premium.
- Preserve and re-present all current content; make it easy to maintain afterward.
- Stay on free static hosting (GitHub Pages).
- Flawless execution: performance, accessibility, and SEO budgets met.

### Non-goals (this round)
- Rewriting bio/copy to de-emphasize the animation/games background (deferred).
- Adding new content (new projects, posts) — we port what exists.
- A CMS or dynamic backend — content stays as files in the repo.
- Custom domain migration (easy to add later; not required now).

## 3. Creative direction

**Cinematic scroll story.** The home page is a single choreographed scroll narrative;
inner pages (individual blog posts, full publications/CV) share the design language but
**drop the heavy motion for readability and performance** ("cinematic home + calmer
inner pages").

### Aesthetic
- **Mood:** dark, cinematic, premium — high-end ML/tech product register.
- **Palette (dark):**
  - Background: near-black with faint cool tint, `#0a0b0f` (deepens to true black for contrast).
  - Text: off-white `#f4f4f5`; muted gray for secondary text.
  - Accent: a single restrained gradient, **cool electric cyan → violet** (`#22d3ee → #818cf8`).
    Evokes "latent space / ML" without literal motion imagery.
- **Typography:**
  - Display/headings: a bold characterful grotesk (**Clash Display** or **General Sans**), self-hosted.
  - Body/UI: **Inter**, self-hosted.
  - Fonts self-hosted (no third-party font requests) with `font-display: swap`.

### Hero visual
- **Drifting "latent-space" particle field**: thousands of soft points flowing along a
  noise field, subtly cursor-reactive, tinted with the accent gradient. Abstract — no
  human figures (deliberately avoids the motion/animation past).
- Degrades to a **static gradient poster** on mobile and under `prefers-reduced-motion`.

### Motion language
- **Lenis** smooth scroll (momentum scrolling).
- **GSAP ScrollTrigger**: text mask-reveals, content rise+fade on enter, a few pinned
  sections (hero copy holds while background shifts), gentle image parallax.
- Micro-interactions: magnetic buttons, hover states, animated custom cursor (desktop).
- Every animation guarded by a `prefers-reduced-motion` fallback that strips motion cleanly.

## 4. Information architecture

### Home page (single cinematic scroll)
1. **Hero** — full viewport: name, one-line identity, animated particle background, scroll cue.
2. **About** — bio + headshot, revealed with pinned/parallax transition.
3. **News / timeline** — career milestones animating in (Wētā FX → Amazon → Ubisoft → PhD).
4. **Publications** — all current papers as scroll-revealed cards (abstract, venue, citations, links).
5. **Projects** — gallery section.
6. **Blog** — teaser of recent posts → links to full post pages.
7. **Footer / contact** — social + email links.

### Inner pages (shared aesthetic, lighter motion)
- `blog/[slug]` — individual post pages (readable, minimal motion).
- `publications` — full publication list/detail.
- `cv` — CV page and/or downloadable PDF.
- `404` — styled not-found page.

## 5. Technical architecture

### Stack
- **Astro** (static output) + TypeScript.
- **Three.js** for the WebGL particle hero (robust, well-documented; tree-shaken, code-split).
- **GSAP** (+ ScrollTrigger) and **Lenis** for scroll choreography.

### Project structure
```
src/
  pages/          index.astro, blog/[slug].astro, publications.astro, cv.astro, 404.astro
  content/        blog/ (markdown posts), config.ts (collection schemas)
  data/           publications.yaml, projects.yaml, news.yaml, site.ts
  components/     Hero (island), section components, ui (Button, Card, Cursor)
  layouts/        BaseLayout (meta/SEO), PostLayout
  styles/         tokens.css (palette, type scale, spacing), global.css
  scripts/        motion.ts (Lenis + GSAP init), hero/ (WebGL particle field)
public/           fonts/, images/, cv.pdf, og images
```

### Content modeling
- **Blog**: Astro content collection of markdown. Port existing Jekyll posts (map
  front-matter, fix asset paths). Generate an **RSS feed**.
- **Publications / projects / news**: typed **YAML** data files with schemas validated at
  build time. Adding a paper later = one YAML entry.
- **Site config** (`site.ts`): single source of truth for name, links, SEO defaults.

### Performance strategy (why it stays fast)
- Page ships as **static HTML/CSS** (instant paint). Only the hero **hydrates** as an
  Astro island, `client:visible`, lazy-loaded and code-split — heavy JS never blocks first paint.
- `motion.ts` initializes Lenis + GSAP once, globally, guarded by reduced-motion.
- Astro `<Image>` for all images; self-hosted fonts with `font-display: swap`.
- Mobile/reduced-motion: static hero poster; scroll animations downgrade to fades/none.

### Accessibility
- Semantic landmarks, visible focus states, WCAG-AA contrast, keyboard navigation,
  complete `prefers-reduced-motion` path.

### SEO
- Per-page meta + Open Graph images, `sitemap`, RSS feed for the blog.

### Deployment
- **GitHub Actions** builds the static site → **GitHub Pages**. Keeps
  `saeed1262.github.io`, free hosting. Custom domain can be added later.

## 6. Migration plan (existing → new)
- Port Jekyll markdown blog posts → Astro content collection (front-matter mapping,
  asset path fixes).
- Convert al-folio publication data → `publications.yaml`.
- Carry over headshot, CV PDF, images into `public/`.
- Preserve existing URLs where reasonable (e.g., blog slugs) to avoid breaking links.

## 7. Quality gates / acceptance criteria
- **Performance:** Lighthouse ≥ 95 (desktop), ≥ 90 (mobile).
- **Accessibility:** Lighthouse a11y ≥ 95; manual keyboard + reduced-motion pass.
- **SEO:** valid sitemap, OG images, RSS; Lighthouse SEO ≥ 95.
- **Content parity:** every piece of current content is present in the new site.
- **Cross-browser:** verified on current Chrome, Safari, Firefox; desktop + mobile.
- **Build:** `astro build` passes clean; no broken internal links.

## 8. Risks & mitigations
- **WebGL performance/jank** → lazy-load, code-split, cap particle count, static fallback.
- **Scroll-jank on low-end/mobile** → Lenis tuned, reduced-motion + mobile fallbacks.
- **Font flash (FOUT)** → self-host, preload, `font-display: swap`.
- **Content migration drift** → content-parity checklist in acceptance criteria.
- **GitHub Pages base-path quirks** → configure Astro `site`/`base` correctly for the
  `<user>.github.io` root.

## 9. Open items (resolved during planning/build, not blocking)
- Exact display typeface (Clash Display vs General Sans) — pick during build.
- Final particle-field tuning (count, speed, cursor reactivity) — tuned live.
- Whether projects/CV get dedicated pages or remain home sections — confirm in plan.
