import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 4213,
    strictPort: true,
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(projectRoot, '../../dist/apps/reference-react'),
    chunkSizeWarningLimit: 1500,
  },
});
