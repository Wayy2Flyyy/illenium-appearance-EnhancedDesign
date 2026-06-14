import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // Resource loads NUI from `illenium-appearance/web/dist` (sibling of this `web-src/web` folder).
    outDir: path.resolve(process.cwd(), '../../web/dist'),
    emptyOutDir: true,
  },
});
