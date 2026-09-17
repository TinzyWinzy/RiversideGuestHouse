import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MVP: plain Vite build + postbuild.mjs SSG-fallback (per-route HTML + meta/JSON-LD/sitemap).
// Upgrade path: replace with Vike pre-render when SEO gate demands full SSR content.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
});
