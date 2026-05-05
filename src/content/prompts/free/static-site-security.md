---
id: "static-site-security"
title: "How to make sure your static website is properly secured"
tier: "free"
category: "web-security"
tags: ["static-site", "jamstack", "sri", "headers", "build-security", "cdn"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 390
expertise: "beginner"
published: true
---

Act as a web security engineer. Your task is to audit and harden my static website against the security risks that are specific to static sites — including misconfigured headers, exposed build artifacts, insecure CDN dependencies, and supply chain attacks via npm.

## Context
Static site generator / framework: [REPLACE — e.g., Astro, Next.js static export, Hugo, Jekyll, plain HTML]
Hosting platform: [REPLACE — e.g., Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3 + CloudFront]
Does the site load scripts or styles from external CDNs? [REPLACE — yes / no, list URLs if yes]
Does the site use a build pipeline with npm/yarn dependencies? [REPLACE — yes / no]

## Required output

### 1. HTTP security headers
Configure all required headers on my hosting platform:
- `Content-Security-Policy` — for a static site with no server-side rendering, a strict policy is easier to implement: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
Provide the exact configuration file for my hosting platform (`netlify.toml`, `vercel.json`, `_headers`, `cloudflare pages headers`)

### 2. Subresource Integrity (SRI) for CDN assets
Any external script or stylesheet loaded from a CDN can be tampered with:
- Generate SRI hashes for every external resource: `openssl dgst -sha384 -binary file.js | openssl base64 -A`
- Add `integrity="sha384-..."` and `crossorigin="anonymous"` to every `<script>` and `<link>` tag pointing to an external URL
- For dynamically versioned CDN URLs (e.g., unpkg, jsDelivr), show how to lock the version and hash

### 3. Protect build artifacts and sensitive files
Ensure these are never publicly served:
- `.git/` directory — should never be in the deploy output
- `.env` files — add to `.gitignore` and confirm they are excluded from the build output folder
- `node_modules/` — confirm not deployed
- Source maps in production — either remove or restrict access (source maps expose original source code)
- `package.json`, `package-lock.json` — if served, they reveal dependency versions useful for targeting known CVEs

### 4. Dependency supply chain audit
- Run `npm audit` and fix all high/critical vulnerabilities before deploying
- Pin dependency versions in `package-lock.json` / `yarn.lock` — commit the lockfile
- Review `postinstall` scripts in dependencies: `npm install --ignore-scripts` for production builds

### 5. Directory listing and error pages
- Confirm directory listing is disabled on the hosting platform
- Custom 404 page: must not reveal framework version, server info, or directory structure
- Confirm no `index.json`, `data.json`, or API response files are accidentally exposed in the public folder

### 6. HTTPS enforcement
- Confirm HTTP requests redirect to HTTPS (301, not 302)
- Confirm no mixed content (HTTP resources on HTTPS pages) — run in browser DevTools console: `window.performance.getEntriesByType('resource').filter(r => r.name.startsWith('http:'))`

### 7. Verification checklist
Numbered steps to confirm all controls are active after deploying.

## Constraints
- Provide configuration for my specific hosting platform
- Flag any header that could break CDN-loaded fonts, analytics, or third-party widgets
- Be concise — no filler
