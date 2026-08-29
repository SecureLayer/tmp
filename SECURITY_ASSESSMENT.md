# Security Assessment

A threat assessment of this project as of [v2026.08.0](https://github.com/SecureLayer/tmp/releases/tag/v2026.08.0), based on the real architecture in [ARCHITECTURE.md](ARCHITECTURE.md). This is a static site with no backend, no database, and no visitor-submitted data — the attack surface is small, but not zero.

## Assets at risk

- **Site integrity** — the deployed content itself. Highest-value target: this is a cybersecurity consultancy's own public-facing site, so a compromise is also a credibility/business risk, not just a technical one.
- **Visitor safety** — no visitor data is collected (see [legal.astro](https://securelayer.co/legal/)), but visitors still trust the site not to serve malicious content (defacement, injected scripts, phishing redirects).
- **Deployment credentials** — Cloudflare account access, held solely by the maintainer.
- **GitHub repository control** — the maintainer's GitHub account is the single point of control for source, releases, and CI/CD.

## Most likely and impactful threats

Ranked by realistic likelihood × impact for this specific system, not a generic OWASP list.

### 1. Maintainer GitHub account compromise (highest impact)

There are two collaborators on the repository: the maintainer with admin access, and a second collaborator with write access acting as a backup maintainer for continuity purposes (see [SECURITY.md](SECURITY.md#project-access)). Cloudflare Workers Builds deploys automatically on every push to `main` — there is no additional human approval gate outside GitHub's own branch protection between a merge and production.

**This is the single most impactful realistic threat for this project** — everything else in this assessment is lower-impact by comparison, because this one bypasses most other controls at once.

**Mitigations in place:** two-factor authentication is enabled on the maintainer's GitHub account (confirmed via account settings — passkey/security-key preferred method, authenticator app also configured), which substantially raises the bar for the specific credential-theft/phishing scenario this threat describes. Branch protection on `main` is now enabled with `enforce_admins: true` — no one, including the account holder, can push directly to `main`; every change must go through a pull request with a passing `build`, CodeQL, and Scorecard status check plus one approval. Secret scanning + push protection reduce (but don't eliminate) the value of a stolen credential; a hardened Content-Security-Policy limits what injected content could actually execute even if a push succeeded.
**Accepted residual risk:** branch protection meaningfully raises the bar (a compromised account must now open a PR and pass real CI checks, not just push silently) but does not fully close this threat for the _account holder specifically_ — GitHub allows a PR author to approve their own PR by default, so a compromised maintainer account could still self-approve and merge. Full closure of that gap would require disallowing self-approval (e.g. via CODEOWNERS), not yet configured. Session-token theft (as opposed to credential theft) can still bypass 2FA in principle; no additional control against this is currently in place beyond GitHub's own session security.

### 2. Supply-chain compromise via a dependency

Lower likelihood than #1 given the deliberately minimal dependency surface (2 runtime + 2 dev dependencies, see [README.md](README.md#dependencies)), but high impact if it happened, since `npm run build` output goes straight to production with no separate review of generated output.

**Mitigations in place:** Dependabot (weekly scans + security alerts), `npm ci` installs exactly from a committed `package-lock.json` (no surprise version drift), CodeQL static analysis on every push/PR, OpenSSF Scorecard tracking supply-chain posture over time.
**Residual risk:** a sufficiently subtle malicious update to `astro` itself (the largest dependency by far) would be hard to catch via automated tooling alone — mitigated in practice by `astro` being a large, widely-used, actively-scrutinized project, not an obscure package.

### 3. Compromised or malicious GitHub Action in CI/CD

A real, precedented class of attack (e.g. the 2025 `tj-actions/changed-files` supply-chain incident). Every workflow in this repo runs on every push/PR, so a compromised Action could theoretically exfiltrate the `GITHUB_TOKEN` or repo contents.

**Mitigations in place:** every third-party action across all 6 workflows is pinned to a specific commit SHA (not a mutable version tag), `step-security/harden-runner` audits network egress on every job, and no workflow references any repository secret at all — so even a fully compromised Action step has nothing sensitive to steal beyond the auto-issued, read-scoped `GITHUB_TOKEN`.

### 4. Third-party interface trust (Google Fonts, Cal.com)

Lowest impact of the four. Google Fonts is a well-known, low-risk third party — the only real exposure is IP address logging, already disclosed. Cal.com booking is a pure outbound link with no data return path into this system, so a Cal.com-side incident would not affect this codebase or its infrastructure at all — the risk is fully transferred.

## Threats considered and deliberately out of scope

Per [SECURITY.md](SECURITY.md#out-of-scope): social engineering, and incidents originating purely within third-party infrastructure (GitHub, Cloudflare, Cal.com) rather than this project's own configuration of it.

## Known open gaps (tracked, not hidden)

- DCO enforcement ([`dco.yml`](.github/workflows/dco.yml)) only runs on pull requests. Now that branch protection requires all changes (including the maintainer's own) to go through a PR, this check will actually run on every real change going forward — previously it had never fired at all, since every prior change was a direct push to `main`.
- PR self-approval is not restricted — see the residual risk noted under Threat #1.
- Cloudflare account access and the domain registrar remain solely with the repository owner; the second collaborator's access covers GitHub only (issues, PRs, releases), not deployment infrastructure or DNS.

## Resolved since the previous revision

- **Branch protection on `main`** is now enabled: pull request required (1 approval), `build`/CodeQL/Scorecard status checks required and must be up to date, `enforce_admins: true`, force-push and branch deletion both disabled.
- **Bus factor raised to 2**: a second collaborator now has real repository write access, closing the single-point-of-failure gap for issue triage, PR review/merge, and releases.

This assessment should be revisited at the next release, or sooner if the architecture changes materially (e.g. a new third-party integration, a contributor other than the sole maintainer, or a move away from static hosting).
