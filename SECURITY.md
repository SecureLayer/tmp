# Security Policy

See [SECURITY_ASSESSMENT.md](SECURITY_ASSESSMENT.md) for the project's threat assessment — the most likely and impactful security risks, and what mitigates each.

## Supported versions

| Version              | Supported |
| -------------------- | --------- |
| latest (main branch) | ✅        |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report privately via [GitHub Security Advisories](https://github.com/SecureLayer/tmp/security/advisories/new).

Include:

- Description of the vulnerability
- Steps to reproduce
- Affected component (site code, build pipeline, dependencies)
- Potential impact

We will acknowledge receipt within **14 days** and aim to resolve confirmed vulnerabilities within **60 days** of confirmation.

### Coordinated disclosure

This project follows coordinated disclosure: please give us the time above to investigate and ship a fix before any public disclosure. Once a confirmed vulnerability is resolved, we will publish a [GitHub Security Advisory](https://github.com/SecureLayer/tmp/security/advisories) describing the issue and crediting the reporter (unless you'd prefer to remain anonymous — just say so in your report). If a fix isn't possible within 60 days, we will proactively update you with a revised timeline rather than go silent.

### Safe harbor

We will not pursue legal action against anyone who reports a vulnerability in good faith through the private channel above, provided they:

- Make a good-faith effort to avoid privacy violations, data destruction, and service disruption
- Do not access or modify data beyond what's needed to demonstrate the issue
- Give us a reasonable opportunity to fix it before any public disclosure

## Scope

This project is a static informational landing page. The primary security concerns are:

- Supply chain issues in build dependencies
- Deployment pipeline integrity
- Content injection or defacement

## Out of scope

- Social engineering
- Issues in third-party infrastructure (GitHub, Cloudflare, Cal.com)

## Project access

This project has a single maintainer with access to sensitive resources: the repository owner ([@SecureLayer](https://github.com/SecureLayer)), who holds sole repository admin rights, deployment credentials, and secrets. There are no other collaborators.

## Roles and responsibilities

This is a single-maintainer project — the repository owner holds every role:

- **Development & review**: writes and merges all changes; external contributions (see [CONTRIBUTING.md](CONTRIBUTING.md)) are reviewed and merged by the same maintainer.
- **Security response**: triages and responds to reports per the timelines above.
- **Release management**: decides when to cut a release and maintains [CHANGELOG.md](CHANGELOG.md).
- **Deployment**: holds the only deployment credentials and pushes production changes.

There is currently no additional contributor or reviewer role — if that changes, this section will be updated accordingly.
