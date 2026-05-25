---
title: "How We Score GitHub Repository Security: Inside the Assessment"
description: "A breakdown of the six checks behind our free GitHub security assessment tool — what we measure, why it matters, and how to improve your score."
date: "2026-05-20"
category: "guide"
tags: ["github", "security", "open-source", "devops", "supply-chain"]
readingTime: 6
published: true
---

Before you clone a repository, add it as a dependency, or run its install script, you're implicitly trusting its security posture. Most developers don't think about that trust — until something goes wrong.

Our free [GitHub Security Assessment](/github-security-assessment) tool tries to make that trust explicit. Paste a repo URL and you get a score in seconds. Here's exactly how that score is calculated and why each check matters.

## The six checks

### 1. Security Policy — 20 points

A `SECURITY.md` file at the root (or in `.github/`) is the standard way for maintainers to tell you: *if you find a vulnerability, here's how to report it responsibly*.

Without it, there's no coordinated disclosure process. Security researchers either go public immediately, report to the wrong person, or give up. All three outcomes are bad.

A missing security policy doesn't mean the project is insecure. It means there's no documented process for handling it when it is.

**How to fix:** Add a `SECURITY.md` with a contact email or private disclosure link. GitHub's Security Advisories feature gives you a private channel for free.

### 2. Dependabot — 25 points

Dependencies are the most common attack surface in modern software. A project that doesn't monitor its own dependencies will eventually run a version with a known CVE — often without knowing it.

Dependabot (GitHub's built-in dependency scanner) automatically opens pull requests when a dependency has a published vulnerability. It's free, opt-in, and takes two minutes to enable.

We weight this check highest because dependency vulnerabilities are the most exploitable gap in most open-source projects — and the easiest to miss.

**How to fix:** Go to Settings → Security → Enable Dependabot alerts and Dependabot security updates.

### 3. CI/CD Pipeline — 20 points

A repository with no CI workflow has no automated quality gate. Code goes from keyboard to main branch without tests, linting, or any automated check.

We look for workflow files in `.github/workflows/`. Their existence is a strong signal that the project has some automated process — even if we can't read what it does.

CI doesn't directly prevent security issues, but it strongly correlates with a project that's being actively maintained and reviewed.

### 4. Active Maintenance — 20 points

A project last touched 18 months ago may still be excellent code. But it won't have patches for vulnerabilities discovered since then.

We check the last push date and flag repos that haven't been touched in over 90 days. For actively developed projects this is rarely an issue. For dependencies you're considering adding to a production system, it matters a great deal.

### 5. License — 10 points

An unlicensed repository is legally ambiguous to use. The absence of a license means the author retains full copyright and you have no explicit permission to use, modify, or distribute the code.

We look for a license file. Any recognised open-source license passes — the check is about clarity, not which license.

### 6. Not Archived — 5 points

GitHub lets maintainers mark a repository as archived, making it read-only and signalling it's no longer maintained. An archived dependency is a dependency that will never be patched.

We flag archived repos as a hard warning. Most repos aren't archived, so this check is a low-weight tiebreaker.

---

## How the grade is calculated

Points from each passing check are summed:

| Grade | Score |
|-------|-------|
| A | 90–100 |
| B | 75–89 |
| C | 55–74 |
| D | 35–54 |
| F | 0–34 |

A **C** grade usually means a well-maintained project with gaps in its security process — common in academic or solo-developer repos that grew large fast.

A **B** or **A** grade means the project has adopted the standard practices that make it easier to trust at scale.

---

## What the score doesn't measure

Our tool uses GitHub's public API without authentication. That means:

- We can't read private files or alerts
- We can't inspect the actual code for vulnerabilities
- We can't check what the CI pipeline actually does
- We don't audit dependency versions against CVE databases

Think of it as a **first-pass signal**, not a full audit. A high score doesn't make a repo safe. A low score doesn't make it dangerous. It tells you whether the maintainers have adopted the practices that make security easier to sustain.

---

## Try it

[Run a free assessment →](/github-security-assessment)

No account required. Works on any public GitHub repository.
