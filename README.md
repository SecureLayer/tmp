[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/SecureLayer/tmp/badge)](https://scorecard.dev/viewer/?uri=github.com/SecureLayer/tmp)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/11681/badge)](https://www.bestpractices.dev/projects/11681)

# SecureLayer

**Freelance cybersecurity services — landing page and service catalogue.**

This repository hosts [securelayer.co](https://securelayer.co), an informational landing page presenting SecureLayer's freelance cybersecurity service catalogue (Application Security, SecDevOps, IT Security, AI Security, security advice) and links to social media. The site does not provide any interactive tool, download, or service directly — book a call at [cal.com/securelayer](https://cal.com/securelayer).

---

## Local development

Prerequisites: Node.js >= 22.12.0

```sh
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # production build → ./dist/
npm run preview    # preview the production build locally
```

---

## Versioning

This project uses [Calendar Versioning](https://calver.org/) (`YYYY.MM.PATCH`). Releases are tagged in git and documented in [CHANGELOG.md](CHANGELOG.md).

---

## Reporting a vulnerability

Please do not open a public issue for security vulnerabilities — see [SECURITY.md](SECURITY.md).

## Feedback and bug reports

Open a GitHub issue for anything else (broken links, incorrect content, site bugs).

---

## Contributing

Contributions are welcome — site fixes, content corrections, and CI/build improvements. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[AGPL-3.0-only](LICENSE) © 2026 SecureLayer
