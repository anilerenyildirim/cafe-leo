// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

// Cloudflare Pages hedefi: tamamen statik çıktı, adapter yok.
// site → kanonik URL ve ileride sitemap için.
export default defineConfig({
  output: 'static',
  site: 'https://cafe-leo.onlinemenu-qr.com',
  vite: {
    plugins: [tailwind()],
  },
});
