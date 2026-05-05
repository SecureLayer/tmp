---
id: "ssllabs-a-plus"
title: "How to reach A+ on SSL Labs SSL Server Test"
tier: "free"
category: "web-security"
tags: ["ssl", "tls", "ssllabs", "https", "cipher-suites", "hsts"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 390
expertise: "intermediate"
published: true
---

Act as a senior TLS/PKI security engineer. Your task is to audit and harden my server's SSL/TLS configuration to achieve an A+ score on the SSL Labs SSL Server Test (https://www.ssllabs.com/ssltest/).

## Context
Stack / web server: [REPLACE — e.g., Nginx 1.24, Apache 2.4, Caddy, Node.js]
Current SSL Labs grade: [REPLACE — or "unknown"]
Certificate authority: [REPLACE — e.g., Let's Encrypt, DigiCert]

## Required output

### 1. Protocol configuration
- **Disable**: SSLv2, SSLv3, TLS 1.0, TLS 1.1
- **Enable**: TLS 1.2 (required) and TLS 1.3 (preferred)
- Provide exact configuration directives for my stack

### 2. Cipher suite hardening
- Keep only AEAD cipher suites with forward secrecy (ECDHE/DHE)
- Remove: RC4, 3DES, NULL, EXPORT, MD5-signed, anonymous ciphers
- Preferred order: TLS 1.3 ciphers first, then TLS 1.2 ECDHE-AESGCM, ECDHE-CHACHA20
- Provide the exact `ssl_ciphers` / `SSLCipherSuite` directive

### 3. Key exchange
- Use ECDH curves: X25519, prime256v1, secp384r1
- If using DHE: generate fresh DH parameters of at least 2048 bits (`openssl dhparam -out dhparam.pem 2048`)
- Enable `ssl_prefer_server_ciphers on`

### 4. HSTS
- Add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- Confirm HSTS is served on the base domain before submitting to the preload list

### 5. Certificate requirements
- Ensure the certificate chain is complete (include intermediate CA)
- Enable OCSP stapling + verify stapling
- Add a DNS CAA record restricting which CAs can issue for this domain

### 6. Additional A+ requirements
- Set `ssl_session_tickets off` (disables session ticket reuse which can weaken forward secrecy)
- Enable `ssl_session_cache` with a shared cache
- Confirm no mixed content on the page (HTTPS page loading HTTP resources)

### 7. Verification steps
Provide a numbered checklist to confirm A+ before re-running the test, including the exact SSL Labs test URL and what each graded category means.

## Constraints
- Output configuration code only for my specified stack
- One sentence per directive explaining why it matters
- Flag any change that could cause a service disruption
- Be concise — no padding, no filler
