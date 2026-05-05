# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| latest (main branch) | ✅ |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: contact@securelayer.co  
Subject line: `[SECURITY] <short description>`

Include:
- Description of the vulnerability
- Steps to reproduce
- Affected component (prompt content, site code, CI pipeline)
- Potential impact

We will acknowledge receipt within **14 days** and aim to resolve confirmed vulnerabilities within **60 days** of confirmation.

## Scope

This project is a static site serving cybersecurity prompt content. The primary security concerns are:
- Prompt content containing secrets or misleading security advice
- Supply chain issues in build dependencies
- Deployment pipeline integrity

## Out of scope

- Social engineering
- Issues in third-party infrastructure (GitHub, Cloudflare)
