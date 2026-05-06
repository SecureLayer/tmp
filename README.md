[![OpenSSF Baseline](https://www.bestpractices.dev/projects/11681/baseline)](https://www.bestpractices.dev/projects/11681)

# SecureLayer

**Precision cybersecurity prompts for AI assistants.**

SecureLayer provides purpose-built, engineer-tested security prompts for Claude, GPT-4o, Gemini, and other AI models. Every prompt is optimised for token efficiency, tuned to your expertise level, and aligned with recognised security standards — OWASP Top 10, cloud hardening, and compliance frameworks including SOC 2, ISO 27001, and GDPR.

**Live site:** [securelayer.co](https://securelayer.co)

---

## Getting started

No installation required to use the prompts. Browse and copy free prompts at [securelayer.co/free-cybersecurity-ai-prompts](https://securelayer.co/free-cybersecurity-ai-prompts).

To run the site locally:

```sh
# Prerequisites: Node.js >= 22.12.0
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # production build → ./dist/
npm run preview    # preview the production build locally
```

---

## Testing

```sh
npm run validate-prompts   # schema validation + secret scan on all prompt files
npm run build              # full Astro build — also validates Zod schema
```

CI runs both checks automatically on every pull request that touches `src/content/prompts/`.

---

## Versioning

This project uses [Calendar Versioning](https://calver.org/) (`YYYY.MM.PATCH`). Releases are tagged in git and documented in [CHANGELOG.md](CHANGELOG.md).

---

## Feedback and bug reports

Open an issue on GitHub. All reports are acknowledged within 14 days.

To report a security vulnerability privately, see [SECURITY.md](SECURITY.md).

---

## Contributing

Contributions are welcome — new prompts, prompt improvements, site fixes, and CI improvements.

See [CONTRIBUTING.md](CONTRIBUTING.md) for submission requirements and the prompt review process.

---

## License

[AGPL-3.0-only](LICENSE) © 2026 SecureLayer
