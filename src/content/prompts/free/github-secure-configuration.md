---
id: "github-secure-configuration"
title: "How to configure and use GitHub securely with SSH and GPG signed commits"
tier: "free"
category: "application-security"
tags: ["github", "ssh", "gpg", "signed-commits", "2fa", "branch-protection"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 430
expertise: "intermediate"
published: true
---

Act as a DevSecOps engineer. Your task is to help me configure GitHub and my local git client for maximum security — covering SSH authentication, GPG commit and push signing, account hardening, and repository protection rules.

## Context
Operating system: [REPLACE — e.g., macOS, Ubuntu, Windows with WSL2]
Git version (run `git --version`): [REPLACE]
Do you already have an SSH key or GPG key configured? [REPLACE — yes / no]
Is this for a personal account, organisation, or both? [REPLACE]

## Required output

### 1. SSH authentication (replace HTTPS + password)
Stop authenticating to GitHub with a username/password or personal access token over HTTPS. Use SSH instead:
- Generate an Ed25519 SSH key: `ssh-keygen -t ed25519 -C "your@email.com" -f ~/.ssh/github_ed25519`
- Protect the private key with a strong passphrase
- Add to `~/.ssh/config`:
  ```
  Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_ed25519
    IdentitiesOnly yes
  ```
- Add the public key to GitHub: Settings → SSH and GPG keys → New SSH key
- Test: `ssh -T git@github.com`
- Convert existing remotes from HTTPS to SSH: `git remote set-url origin git@github.com:user/repo.git`

### 2. GPG key generation and commit signing
Every commit and push should be cryptographically signed so that GitHub (and collaborators) can verify the code came from you:
- Generate a GPG key (RSA 4096 or Ed25519): `gpg --full-generate-key`
- Use the same email address as your GitHub account
- Export the public key: `gpg --armor --export your@email.com`
- Add the public key to GitHub: Settings → SSH and GPG keys → New GPG key
- Tell git which key to use:
  ```
  git config --global user.signingkey <KEY-ID>
  git config --global commit.gpgsign true
  git config --global push.gpgsign if-asked
  ```
- Verify a signed commit: `git log --show-signature -1`

### 3. Enforce signed pushes on the repository
- Enable "Require signed commits" in Branch Protection Rules (Settings → Branches → Add rule)
- This rejects any push where commits are not GPG-signed — prevents unsigned commits from collaborators and CI bots
- For CI/CD pipelines: configure the bot to sign commits using a dedicated GPG key stored as a repository secret

### 4. GitHub account hardening
- Enable 2FA with a hardware security key (YubiKey) or TOTP app — SMS 2FA is not sufficient
- Enable "Vigilant mode" (Settings → SSH and GPG keys → Vigilant mode) — marks all unverified commits with a warning banner on GitHub
- Review and revoke unused OAuth app authorisations: Settings → Applications → Authorized OAuth Apps
- Review and revoke unused personal access tokens: Settings → Developer settings → Personal access tokens
- Use fine-grained personal access tokens with minimum scopes and short expiry instead of classic tokens

### 5. Repository protection rules
For every important branch (`main`, `production`):
- Require pull request reviews before merging (minimum 1 reviewer)
- Require signed commits
- Require status checks to pass before merging
- Restrict who can push directly to the branch
- Enable "Do not allow bypassing the above settings" — prevents admins from bypassing protections

### 6. Protect secrets in the repository
- Enable secret scanning: Settings → Security → Secret scanning
- Enable push protection: blocks pushes that contain detected secrets before they reach the remote
- Enable Dependabot security updates: Settings → Security → Dependabot

### 7. Verification checklist
Numbered steps to confirm SSH auth, GPG signing, and branch protection are all active and working.

## Constraints
- Provide exact commands for my operating system
- Flag the GPG agent configuration needed on macOS (pinentry-mac) and Linux (pinentry-curses)
- Be concise — no filler
