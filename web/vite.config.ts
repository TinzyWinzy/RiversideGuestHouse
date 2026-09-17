import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MVP: plain Vite build + postbuild.mjs SSG-fallback (per-route HTML + meta/JSON-LD/sitemap).
// Upgrade path: replace with Vike pre-render when SEO gate demands full SSR content.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Keep the landing shell lean: framework in a shared chunk, Firebase only in lazy routes.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
