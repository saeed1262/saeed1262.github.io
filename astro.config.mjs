import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// User site (saeed1262.github.io) deploys at domain root => no base path.
export default defineConfig({
  site: 'https://saeed1262.github.io',
  integrations: [sitemap()],
  prefetch: true,
});
