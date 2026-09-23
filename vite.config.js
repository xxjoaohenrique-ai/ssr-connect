import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages hospeda este repositório em /ssr-connect/.
// Cloudflare Pages e desenvolvimento local continuam na raiz /.
const base = process.env.GITHUB_PAGES === 'true' ? '/ssr-connect/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
