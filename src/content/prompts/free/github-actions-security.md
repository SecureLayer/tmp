---
id: "github-actions-security"
title: "How to harden your GitHub Actions workflows against supply chain attacks"
tier: "free"
category: "application-security"
tags: ["github-actions", "ci-cd", "supply-chain", "secrets", "permissions"]
tested: true
tested_on: ["gpt-4o", "claude-sonnet-4-6"]
token_estimate: 430
expertise: "intermediate"
published: true
---

Act as a DevSecOps engineer. Your task is to audit and harden my GitHub Actions workflows to protect against supply chain attacks, secret leakage, and privilege escalation.

## Context
Paste your workflow file(s) here: [REPLACE — paste the full YAML content of your .github/workflows/*.yml files]
Does the repo accept pull requests from external contributors? [REPLACE — yes / no]
Does any workflow deploy to production or cloud infrastructure? [REPLACE — yes / no]

## Required output

### 1. Pin all third-party actions to a full commit SHA
- Replace `uses: actions/checkout@v4` with `uses: actions/checkout@<full-sha>`
- Explain why: tags are mutable — an attacker who compromises an action repo can move a tag to malicious code
- Provide the pinned SHA for every action currently referenced in my workflows

### 2. Apply least-privilege `permissions`
- Add a top-level `permissions: read-all` or `permissions: {}` to deny all by default
- Grant only the specific permissions each job actually needs (e.g., `contents: read`, `pull-requests: write`)
- Flag any workflow that uses `permissions: write-all`

### 3. Audit `pull_request_target` usage
- Flag any workflow using `pull_request_target` — this trigger runs in the context of the base branch and has access to secrets even when triggered by a fork PR
- Provide a safe rewrite pattern if it is necessary

### 4. Prevent secret leakage
- Identify any `run:` step that could echo a secret (e.g., `env` dumps, `echo ${{ secrets.X }}`)
- Ensure secrets are passed via environment variables, never inline in shell commands
- Add `set -u` to shell steps to catch unset variable references early

### 5. Restrict `GITHUB_TOKEN` scope
- Confirm `GITHUB_TOKEN` has only the permissions required per job
- Flag any step that passes `GITHUB_TOKEN` to an untrusted third-party action

### 6. Use OIDC instead of long-lived cloud credentials
- If the workflow authenticates to AWS, GCP, or Azure using stored access keys, replace with OIDC federated identity (no long-lived secrets stored in GitHub)
- Provide the OIDC setup snippet for my cloud provider

### 7. Environment protection rules
- Recommend adding environment protection rules (required reviewers, deployment branches) for any workflow that deploys to production

### 8. Audit checklist
Provide a numbered checklist of everything to verify, with the GitHub docs URL for each mitigation.

## Constraints
- Output only changes relevant to my actual workflow files
- One sentence per finding explaining the attack vector it closes
- Be concise — no filler
