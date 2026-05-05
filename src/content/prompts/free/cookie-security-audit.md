---
id: "cookie-security-audit"
title: "How to audit and harden your web application cookie security"
tier: "free"
category: "web-security"
tags: ["cookies", "session-security", "samesite", "httponly", "csrf"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 370
expertise: "beginner"
published: true
---

Act as a web application security engineer. Your task is to audit all cookies set by my web application and harden them against session hijacking, CSRF, and cross-site leakage attacks.

## Context
Framework / language: [REPLACE — e.g., Express.js, Django, Laravel, Next.js, Rails]
Paste the Set-Cookie headers from your app (open DevTools → Network → any request → Response Headers): [REPLACE]
Does the site use any third-party scripts or iframes that set cookies? [REPLACE — yes / no]
Does the site have cross-domain functionality (e.g., SSO, embedded widgets)? [REPLACE — yes / no]

## Required output

### 1. Audit each cookie against these required flags

For every cookie found, check and apply:

- **`Secure`** — cookie only sent over HTTPS. Missing this allows transmission over HTTP.
- **`HttpOnly`** — cookie inaccessible to JavaScript. Missing this enables XSS-based session theft.
- **`SameSite`** — controls cross-site sending:
  - `Strict`: cookie never sent on cross-site requests (strongest, may break OAuth flows)
  - `Lax`: sent on top-level navigation GET requests only (good default)
  - `None`: sent on all cross-site requests — **requires `Secure`**, use only for legitimate cross-site cookies (e.g., embedded widgets)
- **`Path=/`** — restrict cookie scope to the intended path
- **`Domain`** — omit if not needed; setting it makes the cookie available to all subdomains
- **`Max-Age` / `Expires`** — session cookies should have no expiry; persistent cookies should have a short, justified lifespan

### 2. Apply cookie name prefixes
- **`__Host-`**: forces `Secure`, `Path=/`, no `Domain` — strongest prefix, use for session cookies
- **`__Secure-`**: forces `Secure` flag — use when `__Host-` constraints are too strict
- Example: rename `sessionid` → `__Host-sessionid`

### 3. CSRF protection
- With `SameSite=Strict` or `SameSite=Lax`, most CSRF attacks are mitigated
- For `SameSite=None` cookies or legacy browser support, implement a CSRF token pattern
- Provide the CSRF middleware configuration for my framework

### 4. Session cookie hardening
- Session cookie must be: `HttpOnly; Secure; SameSite=Lax` at minimum
- Rotate the session ID on privilege escalation (login, sudo actions)
- Invalidate server-side on logout — do not rely only on deleting the client cookie

### 5. Implementation
Provide the exact cookie configuration for my framework covering all session and auth cookies.

### 6. Verification checklist
How to re-inspect cookies in browser DevTools and confirm all flags are applied correctly.

## Constraints
- Output configuration code for my specific framework only
- Flag any flag change that could break cross-domain or OAuth flows
- Be concise — no filler
