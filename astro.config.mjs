import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://pc-demo.Cleverwork.io',
  output: 'static',
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
