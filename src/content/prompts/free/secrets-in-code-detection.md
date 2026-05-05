---
id: "secrets-in-code-detection"
title: "How to detect and remove hardcoded secrets from your codebase"
tier: "free"
category: "application-security"
tags: ["secrets", "credentials", "git", "gitleaks", "api-keys", "env-vars"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 410
expertise: "beginner"
published: true
---

Act as an application security engineer. Your task is to help me detect, remove, and prevent hardcoded secrets (API keys, passwords, tokens, certificates) in my codebase and git history.

## Context
Language / framework: [REPLACE — e.g., Node.js, Python, PHP, Go]
Repository type: [REPLACE — public / private]
Has the repo ever been public? [REPLACE — yes / no]
CI/CD platform: [REPLACE — e.g., GitHub Actions, GitLab CI, CircleCI]

## Required output

### 1. Immediate scan — detect secrets now
Provide the exact commands to run Gitleaks against my repository (both current files and full git history):
```
# Install and run
brew install gitleaks          # macOS
gitleaks detect --source . -v  # scan working tree
gitleaks detect --source . --log-opts="--all" -v  # scan full git history
```
Explain how to interpret the output and prioritise findings by severity.

### 2. Secret patterns to search for manually
Provide `grep` / `ripgrep` commands to find common secret patterns:
- API keys (generic patterns, AWS, GCP, Stripe, Twilio)
- Passwords and connection strings (`password=`, `passwd=`, `DB_PASSWORD`)
- Private keys (`-----BEGIN`)
- JWT secrets and tokens
- `.env` files accidentally committed

### 3. Purge secrets from git history
If secrets are found in past commits:
- Use `git filter-repo` to rewrite history and remove the file or string (preferred over `git filter-branch`)
- Provide the exact command for my case
- **Warn**: history rewrite requires force-push and all collaborators must re-clone

### 4. Immediate rotation
List which secrets must be rotated immediately after discovery (assume any committed secret is compromised):
- Revoke and reissue API keys from the provider dashboard
- Rotate database passwords and update all connection strings
- Invalidate JWT signing secrets and force re-login for all users

### 5. Replace with environment variables
Show the correct pattern for my stack to load secrets from environment variables, not source code:
- `.env` file (local dev only — never committed)
- `.gitignore` entry: `.env`, `*.pem`, `*.key`, `config/secrets.*`
- Production: use the CI/CD secrets store or a secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler)

### 6. Pre-commit hook to prevent future commits
Set up a pre-commit hook using Gitleaks to block secret commits before they reach the repo:
```
gitleaks protect --staged -v
```
Provide the `.pre-commit-config.yaml` entry and installation steps.

### 7. CI/CD scanning
Add a Gitleaks scan step to my CI pipeline that fails the build if secrets are detected. Provide the workflow snippet for my CI platform.

## Constraints
- Prioritise rotation over remediation — assume any exposed secret is already compromised
- Flag the difference between secrets in current code vs secrets only in git history
- Be concise — no filler
