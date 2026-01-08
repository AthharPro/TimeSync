/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(({ mode }) => ({
  // ✅ Important for Nx
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/ui',

  // ✅ BASE PATH (CRITICAL FOR AZURE)
  // Azure Static Web Apps expects "/"
  base: '/',

  server: {
    port: 4200,
    host: 'localhost',

    // ✅ Proxy ONLY for local development
    proxy:
      mode === 'development'
        ? {
            '/auth': {
              target: 'http://localhost:3000',
              changeOrigin: true,
              secure: false,
            },
            '/api': {
              target: 'http://localhost:3000',
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
  ],

  build: {
    outDir: '../../dist/apps/ui',
    emptyOutDir: true,
    reportCompressedSize: true,

    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
