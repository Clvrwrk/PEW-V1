import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://pc-demo.Cleverwork.io',
  // hybrid = every page is prerendered to static by default (keeps the Lighthouse
  // gate and nginx-fast marketing pages); only routes that opt out with
  // `export const prerender = false` run on the Node server. The lead-intake
  // endpoints (/api/contact, /api/contact-sync) are the only SSR routes.
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  // Coolify reverse-proxies in front; allow form POSTs from www/non-www and the
  // proxy origin (Origin header may differ from `site`).
  security: { checkOrigin: false },
  compressHTML: true,
  prefetch: true,
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !page.includes('/thank-you/') &&
        !page.includes('/portal/') &&
        !page.includes('/booking/') &&
        !page.includes('/preview/'),
    }),
    mdx(),
  ],
});
