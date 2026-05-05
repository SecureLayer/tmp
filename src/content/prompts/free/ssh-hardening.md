---
id: "ssh-hardening"
title: "How to harden your SSH server configuration"
tier: "free"
category: "network-security"
tags: ["ssh", "linux", "server-hardening", "sshd", "authentication"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 380
expertise: "beginner"
published: true
---

Act as a Linux system security engineer. Your task is to audit and harden my SSH server configuration to eliminate common attack vectors including brute force, credential stuffing, and lateral movement.

## Context
OS / distribution: [REPLACE — e.g., Ubuntu 22.04, Debian 12, CentOS 9]
Current sshd_config (run `cat /etc/ssh/sshd_config`): [REPLACE — paste content]
Is this server publicly accessible on the internet? [REPLACE — yes / no]
Do any automated systems (scripts, CI/CD, backups) connect via SSH? [REPLACE — yes / no, list them]

## Required output

### 1. Authentication hardening
- Disable password authentication: `PasswordAuthentication no`
- Disable root login: `PermitRootLogin no`
- Disable empty passwords: `PermitEmptyPasswords no`
- Disable challenge-response auth: `ChallengeResponseAuthentication no`
- Enforce public key authentication only

### 2. Restrict access
- Limit which users can connect: `AllowUsers <user1> <user2>`
- Bind SSH to a specific interface if the server has multiple network interfaces
- Set `MaxAuthTries 3` to limit brute force attempts
- Set `LoginGraceTime 30` to close unauthenticated connections quickly

### 3. Cryptographic hardening
- Remove weak host key algorithms — keep only Ed25519 and ECDSA 521
- Restrict key exchange algorithms to: `curve25519-sha256, ecdh-sha2-nistp521`
- Restrict ciphers to AEAD only: `chacha20-poly1305@openssh.com, aes256-gcm@openssh.com, aes128-gcm@openssh.com`
- Restrict MACs to: `hmac-sha2-512-etm@openssh.com, hmac-sha2-256-etm@openssh.com`
- Regenerate weak host keys if RSA < 3072 bits or DSA keys are present

### 4. Session and idle timeout
- Set `ClientAliveInterval 300` and `ClientAliveCountMax 2` to disconnect idle sessions after 10 minutes
- Set `MaxSessions 4` to limit concurrent sessions per connection

### 5. Disable unused features
- Disable X11 forwarding: `X11Forwarding no`
- Disable TCP forwarding if not needed: `AllowTcpForwarding no`
- Disable agent forwarding: `AllowAgentForwarding no`
- Disable `sshd` banner disclosure: set `Banner none`

### 6. Brute force protection
- Install and configure `fail2ban` with a rule for `sshd` (ban after 5 failures, 1-hour ban)
- If using a cloud provider, restrict the security group / firewall to known IP ranges

### 7. Audit and logging
- Set `LogLevel VERBOSE` to log accepted key fingerprints
- Confirm SSH logs are forwarded to a central log server or SIEM

### 8. Verification
- Test the new config before disconnecting: `sshd -t` (dry run, reports errors without restarting)
- Provide the exact reload command for my OS
- Provide a post-hardening checklist

## Constraints
- Output the complete hardened `sshd_config` snippet ready to paste
- Flag any directive that could lock me out if applied incorrectly
- Always recommend testing with `sshd -t` before restarting the daemon
- Be concise — no filler
