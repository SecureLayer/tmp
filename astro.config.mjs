// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

const ASSESSMENTS_FILE = resolve(
  __dir,
  "../sl-tools/sl-scan-repos/sl-assessments.json",
);

/** Vite plugin — mocks /api/* in dev mode using local files */
const apiMock = {
  name: "sl-api-mock",
  /** @param {import('vite').ViteDevServer} server */
  configureServer(server) {
    /** @type {import('vite').Connect.NextHandleFunction} */
    const handleApiMock = (req, res, next) => {
      const url = req.url?.split("?")[0];

      if (url === "/api/health") {
        res.setHeader("Content-Type", "application/json");
        return void res.end(
          JSON.stringify({ status: "ok", version: "0.3.0-dev" }),
        );
      }

      if (url === "/api/assessments" && req.method === "GET") {
        try {
          const data = readFileSync(ASSESSMENTS_FILE);
          res.setHeader("Content-Type", "application/json");
          return void res.end(data);
        } catch {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          return void res.end(
            JSON.stringify({ error: "No assessments published yet." }),
          );
        }
      }

      next();
    };
    server.middlewares.use(handleApiMock);
  },
};

export default defineConfig({
  site: "https://securelayer.co",
  output: "static",
  integrations: [sitemap()],
  build: {
    // Emit ALL CSS as external files (no inline <style>) so the CSP can drop
    // 'unsafe-inline' from style-src — required for Observatory A+ under algorithm v5.
    inlineStylesheets: "never",
  },
  vite: {
    plugins: [apiMock],
  },
});
