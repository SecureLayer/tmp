---
id: "spf-dmarc-spoofing"
title: "How to check SPF and DMARC records to detect email spoofing vulnerabilities"
tier: "free"
category: "web-security"
tags: ["spf", "dmarc", "email-security", "dns", "spoofing", "phishing"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 400
expertise: "beginner"
published: true
---

Act as an email security engineer. Your task is to audit my domain's SPF and DMARC DNS records to detect misconfigurations that would allow an attacker to spoof emails from my domain.

## Context
Domain to audit: [REPLACE — e.g., example.com]
Do you send emails from third-party services (e.g., Mailchimp, SendGrid, Google Workspace)? [REPLACE — yes / no, list services if yes]
Current SPF record (run `dig TXT example.com` to find it): [REPLACE — or "none"]
Current DMARC record (run `dig TXT _dmarc.example.com`): [REPLACE — or "none"]

## Required output

### 1. SPF audit
- Retrieve and parse the current SPF record
- Identify vulnerabilities:
  - Missing SPF record (domain is fully spoofable)
  - Use of `~all` (softfail — attackers can still deliver spoofed mail)
  - Use of `?all` (neutral — equivalent to no policy)
  - Use of `+all` (critical: permits anyone to send as this domain)
  - Too many DNS lookups (SPF limit is 10 — exceeding it causes a `permerror`)
  - Overly broad `include:` statements
- Provide a corrected SPF record using `-all` (hardfail)

### 2. DMARC audit
- Retrieve and parse the current DMARC record
- Identify vulnerabilities:
  - Missing DMARC record (spoofed emails pass silently)
  - Policy set to `p=none` (monitoring only — no enforcement, spoofing succeeds)
  - `pct=` below 100 (policy only applied to a percentage of mail)
  - Missing `rua=` tag (no aggregate reports — you're flying blind)
  - Missing `ruf=` tag (no forensic reports on failures)
- Provide a hardened DMARC record with `p=quarantine` as a first step, then `p=reject` once reports confirm no legitimate mail is blocked

### 3. DKIM check
- Explain how to verify DKIM is configured for all sending services
- Common selector lookup: `dig TXT default._domainkey.example.com`
- Flag if DKIM is absent (DMARC alignment will fail even with SPF passing)

### 4. Live spoofing test
After applying the fixes, verify the domain is no longer spoofable using the free tool at:
https://caniphish.com/free-phishing-tools/email-spoofing-test

Explain what each result status means (Spoofable / Partially Spoofable / Not Spoofable) and what further action each requires.

### 5. Hardened record templates
Provide ready-to-publish DNS records:
- SPF: `v=spf1 [your legitimate senders] -all`
- DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@[domain]; ruf=mailto:dmarc-failures@[domain]; pct=100; adkim=s; aspf=s`

## Constraints
- Explain each tag in SPF and DMARC in plain language
- Flag any change that could break legitimate email delivery before applying
- Recommend a staged rollout: `p=none` → `p=quarantine` → `p=reject`
- Be concise — no filler
