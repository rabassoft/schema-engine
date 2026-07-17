import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: projectRoot,
  server: {
    host: '127.0.0.1',
    port: 4211,
    strictPort: true,
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(projectRoot, '../../dist/apps/reference-standard'),
  },
});
