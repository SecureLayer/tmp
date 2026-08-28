// @ts-check
import { defineConfig } from 'astro/config';
import sitemap          from '@astrojs/sitemap';
import { readFileSync }  from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

const ASSESSMENTS_FILE = resolve(__dir, '../sl-tools/sl-scan-repos/sl-assessments.json');

const VOTE_CANDIDATES = [
  { repo: 'mendableai/firecrawl',  stars: 124000, desc: 'Web scraping & crawling for AI/LLM pipelines',         votes: 0 },
  { repo: 'iptv-org/iptv',         stars: 116000, desc: 'Collection of 8000+ publicly available IPTV channels',  votes: 0 },
  { repo: 'supabase/supabase',     stars: 74000,  desc: 'Open-source Firebase alternative',                      votes: 0 },
  { repo: 'apache/superset',       stars: 62000,  desc: 'Business intelligence and data visualisation platform',  votes: 0 },
  { repo: 'localstack/localstack', stars: 58000,  desc: 'AWS cloud emulator for local development',              votes: 0 },
  { repo: 'n8n-io/n8n',           stars: 52000,  desc: 'Workflow automation with 400+ integrations',            votes: 0 },
  { repo: 'pocketbase/pocketbase', stars: 43000,  desc: 'Open-source backend in a single Go binary',            votes: 0 },
  { repo: 'novuhq/novu',           stars: 34000,  desc: 'Open-source notification infrastructure',              votes: 0 },
  { repo: 'unclecode/crawl4ai',    stars: 32000,  desc: 'Async web crawler built for AI data extraction',       votes: 0 },
  { repo: 'BerriAI/litellm',      stars: 19000,  desc: 'Call 100+ LLM APIs using the OpenAI format',           votes: 0 },
];

/** Vite plugin — mocks /api/* in dev mode using local files */
const apiMock = {
  name: 'sl-api-mock',
  /** @param {import('vite').ViteDevServer} server */
  configureServer(server) {
    /** @type {import('vite').Connect.NextHandleFunction} */
    const handleApiMock = (req, res, next) => {
      const url = req.url?.split('?')[0];

      if (url === '/api/health') {
        res.setHeader('Content-Type', 'application/json');
        return void res.end(JSON.stringify({ status: 'ok', version: '0.3.0-dev' }));
      }

      if (url === '/api/assessments' && req.method === 'GET') {
        try {
          const data = readFileSync(ASSESSMENTS_FILE);
          res.setHeader('Content-Type', 'application/json');
          return void res.end(data);
        } catch {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return void res.end(JSON.stringify({ error: 'No assessments published yet.' }));
        }
      }

      if (url === '/api/vote/candidates' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        return void res.end(JSON.stringify(VOTE_CANDIDATES));
      }

      if (url === '/api/vote' && req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json');
        return void res.end(JSON.stringify({ votes: 1 }));
      }

      next();
    };
    server.middlewares.use(handleApiMock);
  },
};

export default defineConfig({
  site: 'https://securelayer.co',
  output: 'static',
  integrations: [sitemap()],
  build: {
    // Emit ALL CSS as external files (no inline <style>) so the CSP can drop
    // 'unsafe-inline' from style-src — required for Observatory A+ under algorithm v5.
    inlineStylesheets: 'never',
  },
  vite: {
    plugins: [apiMock],
  },
});
