# Changelog

All notable changes to this project are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Calendar Versioning](https://calver.org/) — `YYYY.MM.PATCH`.

## [Unreleased]

### Added

- DCO and release-signing (Sigstore/SLSA provenance) CI workflows.
- `ARCHITECTURE.md`, `SECURITY_ASSESSMENT.md`, `CODE_OF_CONDUCT.md`, `ROADMAP.md`.
- Real accessibility regression test (`scripts/check-a11y.mjs`, axe-core + Playwright), wired into CI.
- Second repository collaborator with write access, for project continuity (bus factor 2).
- Branch protection on `main` — pull request + status checks required, no exceptions for admins.

### Changed

- Adopted Prettier as the project's formatting standard; reformatted the full codebase.
- `tsconfig.json` moved to Astro's strictest TypeScript preset.
- `/security`'s "Is our own supply chain secure?" section now shows real, live OpenSSF Scorecard (8.7/10) and Best Practices (Silver) data instead of a placeholder.
- Achieved OpenSSF Best Practices Silver badge and Baseline Level 2.

### Fixed

- Real path-traversal finding (CodeQL `js/path-injection`) in the accessibility test's local dev server.
- Real color-contrast violations (found by the new accessibility test) across `/security`, `/sustainability`, and the homepage.
- Mobile visibility bug: per-card descriptions on `/security` were hidden entirely (`display: none`), not just small.
- OpenSSF Scorecard public indexing — the project wasn't appearing on the public API/viewer despite the workflow succeeding; resolved by re-adding the workflow through GitHub's official guided setup flow instead of a hand-authored equivalent.

## [2026.08.0] — 2026-08-28

### Changed

- Site repositioned as a service catalogue — no interactive tools provided directly through the website. Removed the AI-prompts page entirely; the GitHub repository assessment tool is no longer promoted anywhere.
- Contact moved to [cal.com/securelayer](https://cal.com/securelayer) — email is no longer processed anywhere on the site.
- Legal page reflects real publisher information, the Cal.com contact change, and a CGV (terms of sale) note.
- `SECURITY.md` and the live `/security` scope section now point to GitHub Security Advisories.
- New macOS-style lock screen on desktop before the main scene.
- Mobile homepage UI refinements: fixed a horizontal-scroll bug, redesigned the Expertise card, consistent icon sizing, reordered/restored social and Signal contact options.

### Added

- CI (build + typecheck), CodeQL (SAST), and OpenSSF Scorecard workflows.

### Fixed

- Accessibility: legal page color-contrast (verified with axe-core) and link-in-text-block issues.
- SEO: missing meta descriptions and under-sized text/images on `/security` and `/sustainability`.
- Pre-existing broken Lighthouse CI workflow (missing config file, dead audited URLs).

### Removed

- Orphaned AI-prompts content collection, validation script, and related dead code.

## [2026.05.0] — 2026-05-06

### Added

- Initial public release of SecureLayer at securelayer.co
- 12 free cybersecurity prompts: SSH hardening, TLS configuration, OWASP Top 10 basics, cookie security, HTTP security headers, GitHub Actions security, secrets detection, static site security, SPF/DMARC spoofing prevention, SSL Labs A+ configuration, Mozilla Observatory A+ configuration, open redirect detection
- Automated prompt validation CI pipeline — schema validation, secret scanning, full build check on every pull request
- Pull request template with prompt submission checklist
- AGPL-3.0 license
