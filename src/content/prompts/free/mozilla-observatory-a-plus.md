---
id: "mozilla-observatory-a-plus"
title: "How to reach A+ for your website on Mozilla HTTP Observatory"
tier: "free"
category: "web-security"
tags: ["http-headers", "csp", "hsts", "security-headers", "mozilla-observatory", "hardening"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 420
expertise: "intermediate"
published: true
---

Act as a senior web security engineer. Your task is to audit and harden the HTTP response headers of my web application to achieve an A+ score on the Mozilla HTTP Observatory (https://observatory.mozilla.org).

## Context
Stack: [REPLACE — e.g., Nginx, Express.js, Next.js, Astro, Apache]
Current Observatory score: [REPLACE — or "unknown"]
Framework / language: [REPLACE — e.g., Node.js 20, PHP 8.2]

## Required output

### 1. Security Headers — exact copy-paste configuration for my stack

- **Content-Security-Policy** — build a strict policy using nonces (not `unsafe-inline`). Whitelist only trusted sources. Add `upgrade-insecure-requests`.
- **Strict-Transport-Security** — use `max-age=63072000; includeSubDomains; preload`
- **X-Content-Type-Options** — `nosniff`
- **X-Frame-Options** — `DENY` (use `SAMEORIGIN` only if iframes are required internally)
- **Referrer-Policy** — `strict-origin-when-cross-origin`
- **Permissions-Policy** — disable camera, microphone, geolocation unless the application requires them

### 2. Cookie Security
For every `Set-Cookie` header in the app, add:
- `Secure` flag
- `HttpOnly` flag
- `SameSite=Strict` (or `Lax` only if cross-site navigation is required)

### 3. Remove Fingerprinting Headers
Strip these headers from all responses:
- `Server`
- `X-Powered-By`
- `X-AspNet-Version`
- `X-AspNetMvc-Version`

### 4. CSP Deployment Strategy (no-break rollout)
1. Deploy `Content-Security-Policy-Report-Only` first
2. Monitor violations for 48 hours
3. Tighten the policy based on reported violations
4. Switch to enforcing `Content-Security-Policy`

### 5. Verification Checklist
Provide a numbered checklist to confirm A+ compliance before going live, including how to re-run the Observatory scan and interpret the results.

## Constraints
- Output configuration code only for my specified stack
- One sentence per header explaining why it matters
- Flag any header that could break existing functionality
- Be concise — no padding, no filler text
