---
id: "securityheaders-a"
title: "How to get an A+ rating on SecurityHeaders.com"
tier: "free"
category: "web-security"
tags: ["security-headers", "http-headers", "csp", "permissions-policy", "referrer-policy"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 360
expertise: "beginner"
published: true
---

Act as a web security engineer. Your task is to implement all HTTP response headers required to achieve an A rating on SecurityHeaders.com (https://securityheaders.com/).

## Context
Stack / web server: [REPLACE — e.g., Nginx, Apache, Express.js, Next.js, Astro]
Current SecurityHeaders.com grade: [REPLACE — or "unknown"]
Does the site use iframes from external sources? [REPLACE — yes / no]
Does the site use inline scripts or styles? [REPLACE — yes / no]

## Required output

### 1. Headers to add — exact configuration for my stack

- **Strict-Transport-Security**
  Value: `max-age=31536000; includeSubDomains`

- **Content-Security-Policy**
  Build a policy appropriate for my site. If inline scripts/styles are used, use nonces rather than `unsafe-inline`. Minimum viable policy if unsure: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`

- **X-Content-Type-Options**
  Value: `nosniff`

- **X-Frame-Options**
  Value: `DENY` (use `SAMEORIGIN` only if the site embeds its own pages in iframes)

- **Referrer-Policy**
  Value: `strict-origin-when-cross-origin`

- **Permissions-Policy**
  Disable unused browser features. Suggested starting point: `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`

### 2. Headers to remove
Strip these headers to avoid information disclosure:
- `Server`
- `X-Powered-By`
- `X-Generator`

### 3. CSP safe deployment
1. First deploy with `Content-Security-Policy-Report-Only` header
2. Check browser console for violations for 24–48 hours
3. Adjust policy to eliminate violations
4. Switch to enforcing `Content-Security-Policy`

### 4. Verification checklist
Numbered steps to confirm an A grade before re-scanning, including how to interpret each header result on SecurityHeaders.com.

## Constraints
- Provide copy-paste configuration for my specified stack only
- One sentence per header explaining the security benefit
- Flag any header that may break existing site functionality
- Keep output concise — no filler
