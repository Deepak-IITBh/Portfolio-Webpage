import { defineConfig, loadEnv, type Plugin, type PreviewServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { handleContact } from './server/contact.mjs';

/** Serves POST /api/contact during `npm run dev` / `npm run preview` using the same handler as production. */
function contactApi(mode: string): Plugin {
  const env = { ...loadEnv(mode, process.cwd(), ''), NODE_ENV: mode === 'production' ? 'production' : 'development' };
  const attach = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use('/api/contact', (req, res) => void handleContact(req, res, env));
  };
  return { name: 'contact-api', configureServer: attach, configurePreviewServer: attach };
}

/** Fills %SITE_URL% in index.html (canonical + Open Graph URLs). Set SITE_URL when building for production. */
function siteUrl(mode: string): Plugin {
  const url = (loadEnv(mode, process.cwd(), '').SITE_URL || process.env.SITE_URL || 'https://deepak-iitbh.github.io').replace(/\/+$/, '');
  return { name: 'site-url', transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', url) } };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), contactApi(mode), siteUrl(mode)],
  build: { target: 'es2020', sourcemap: false },
}));
