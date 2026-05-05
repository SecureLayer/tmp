// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://securelayer.co',
  output: 'static',
  adapter: cloudflare(),
});