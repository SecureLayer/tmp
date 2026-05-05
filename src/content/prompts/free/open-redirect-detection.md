---
id: "open-redirect-detection"
title: "How to detect and fix open redirect vulnerabilities in your web application"
tier: "free"
category: "web-security"
tags: ["open-redirect", "owasp", "input-validation", "phishing", "url-validation"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 395
expertise: "intermediate"
published: true
---

Act as a web application security engineer. Your task is to find and fix open redirect vulnerabilities in my web application — endpoints that blindly redirect users to an attacker-controlled URL, enabling phishing and credential harvesting.

## Context
Framework / language: [REPLACE — e.g., Express.js, Django, Laravel, Next.js, Spring Boot]
Paste the relevant redirect code or route handler: [REPLACE — or describe how redirects work in your app]
Does the app use `?next=`, `?redirect=`, `?url=`, `?return_to=`, or similar parameters? [REPLACE — yes / no]
Is this a login/logout flow, OAuth callback, or general navigation redirect? [REPLACE]

## Required output

### 1. Identify vulnerable patterns
Flag any of the following in my code:
- Direct use of user-supplied input in a redirect: `res.redirect(req.query.next)`
- Insufficient validation (only checking prefix): `if (url.startsWith('/')) redirect(url)` — bypassable with `//evil.com`
- Trusting the `Referer` header for redirect destination
- Passing unsanitised URLs to frontend JavaScript: `window.location = param`

### 2. Common bypass techniques to test against my fix
Ensure my fix resists all of these:
- `//evil.com` — protocol-relative URL, treated as absolute by browsers
- `https:evil.com` — missing slashes, some parsers accept this
- `/%09/evil.com` — tab character before domain
- `https://legitimate.com@evil.com` — URL with credentials section
- `javascript:alert(1)` — JavaScript pseudo-protocol
- Unicode/URL-encoded variants of the above

### 3. The correct fix — allowlist approach
Implement a redirect allowlist (never a blocklist):

**Option A — relative paths only (strictest)**
Validate that the destination is a relative path starting with `/` and contains no `//` or protocol:
```
function isSafeRedirect(url) {
  return url.startsWith('/') && !url.startsWith('//') && !url.includes(':');
}
```

**Option B — allowlisted domains (for cross-domain redirects)**
Parse the URL and compare the hostname against an explicit list of trusted domains:
```
const ALLOWED_HOSTS = ['app.example.com', 'example.com'];
const parsed = new URL(url, 'https://example.com');
if (!ALLOWED_HOSTS.includes(parsed.hostname)) throw new Error('Invalid redirect');
```

Implement Option A or B for my framework and paste the corrected route handler.

### 4. Framework-specific safe redirect helpers
Provide the built-in safe redirect method for my framework (many frameworks have one):
- Django: `django.utils.http.is_safe_url()`
- Laravel: `redirect()->intended()` with validated URLs
- Rails: `redirect_back` with `fallback_location`
- Express.js: no built-in — implement Option A above

### 5. Testing
Provide a manual test checklist and a `curl` / browser test sequence to confirm the fix rejects all bypass variants listed in section 2.

### 6. Related issues to check
- Confirm that OAuth `redirect_uri` parameters are validated against a pre-registered allowlist
- Check for open redirects in password reset and email confirmation flows

## Constraints
- Implement the allowlist approach — never a blocklist
- Output code only for my specified framework
- Flag every redirect parameter in my code that needs validation
- Be concise — no filler
