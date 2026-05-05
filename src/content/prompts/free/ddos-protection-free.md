---
id: "ddos-protection-free"
title: "How to protect your website from DDoS attacks for free"
tier: "free"
category: "network-security"
tags: ["ddos", "cloudflare", "rate-limiting", "waf", "nginx", "firewall"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 410
expertise: "beginner"
published: true
---

Act as a network security engineer. Your task is to help me implement free DDoS protection layers for my website, from the DNS edge down to the origin server.

## Context
Hosting environment: [REPLACE — e.g., VPS on DigitalOcean, shared hosting, Vercel, Netlify, bare metal]
Web server: [REPLACE — e.g., Nginx, Apache, Caddy, or managed]
Approximate normal traffic: [REPLACE — e.g., 1,000 visits/day]
Is the origin server IP currently public / exposed? [REPLACE — yes / no]

## Required output

### 1. Cloudflare free tier (strongest free protection)
- Set up Cloudflare as a reverse proxy in front of my origin — all traffic passes through Cloudflare's scrubbing network
- Configure DNS to proxy records (orange cloud) so the origin IP is hidden
- Enable "Under Attack Mode" for active DDoS events
- Configure rate limiting rules in the free tier (100,000 requests/day limit): block IPs sending more than [X] requests per minute to sensitive endpoints (`/login`, `/api/`, `/wp-admin`)
- Enable Cloudflare WAF managed rules (free tier)
- Set Browser Integrity Check on

### 2. Origin server firewall — block direct-to-IP attacks
Even with Cloudflare, attackers who discover the origin IP can bypass it:
- Allow inbound HTTP/HTTPS only from Cloudflare IP ranges (publish at https://www.cloudflare.com/ips/)
- Block all other inbound traffic on port 80/443 using `ufw` or `iptables`
- Provide the exact firewall rules for my hosting environment

### 3. Nginx / Apache rate limiting at origin
Secondary layer in case traffic bypasses the CDN:
- `limit_req_zone` and `limit_req` directives (Nginx) — limit requests per IP
- `LimitRequestBody` and `mod_evasive` (Apache)
- Provide the exact configuration block for my web server

### 4. Fail2ban for HTTP flood
- Configure a Fail2ban jail that monitors the access log for IPs exceeding a request threshold
- Ban offending IPs at the firewall level for 1 hour
- Provide the jail config and filter regex

### 5. Reduce attack surface
- Disable unused ports and services
- Serve static assets from a CDN so the origin handles less load
- Enable HTTP/2 (more efficient, handles burst traffic better)
- Set aggressive browser caching headers to reduce repeat requests to origin

### 6. During an active attack — response playbook
Numbered steps to take when an attack is detected:
1. Enable Cloudflare "Under Attack Mode"
2. Identify attacking IP ranges in logs
3. Add manual IP block rules
4. Contact hosting provider if bandwidth is saturated at the network layer (L3/L4 attacks require upstream mitigation)

## Constraints
- All solutions must be free or use free tiers only
- Flag any step that could block legitimate users if misconfigured
- Be concise — no filler
