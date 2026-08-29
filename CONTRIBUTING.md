# Contributing to SecureLayer

Thank you for helping improve this site.

## Ways to contribute

- Fix a bug or broken link
- Correct outdated or inaccurate content
- Improve the CI/build pipeline

## Code contributions

1. Fork the repository
2. Create a branch for your change
3. Run `npm run build` before opening a PR and confirm it passes with no errors
4. Open a pull request with a clear description of what changed and why

## Requirements for acceptable contributions

A pull request will only be merged if it meets all of the following:

- **CI passes** — the `CI` workflow (build + `astro check`) must succeed. CodeQL and Scorecard must not introduce new findings.
- **One focused change per PR** — unrelated fixes should be separate pull requests.
- **No secrets or credentials** — GitHub push protection will block these, but don't rely on it as your only check.
- **Accurate, working links and content** — anything user-facing must be verified, not assumed.
- **Every commit must be signed off (DCO)** — see below.
- **New functionality gets a test** — if a PR adds major new functionality (a new page, a new build step, a new script), add or extend an automated test covering it in `scripts/` and wire it into `npm test`. Content-only fixes (typos, copy changes) don't require one.
- **Follow the project's code style** — formatting is enforced by [Prettier](https://prettier.io) (config in `.prettierrc.json`). Run `npm run format` before committing, or `npm run format:check` to verify without changing files.

PRs that don't meet these will be asked for changes before review, not merged as-is.

## Developer Certificate of Origin (DCO)

Every commit must include a `Signed-off-by` trailer certifying you wrote it or otherwise have the right to submit it under this project's [AGPL-3.0-only license](LICENSE), per the [Developer Certificate of Origin](https://developercertificate.org/).

Add it automatically:

```sh
git commit -s -m "your commit message"
```

This appends a line like `Signed-off-by: Your Name <you@example.com>` using your configured git identity. To fix commits you already made, amend them: `git commit --amend -s`. A `DCO` check runs on every pull request and blocks merge if any commit is missing this trailer.

## Reporting bugs or inaccurate content

Open a GitHub issue with a clear description of the problem and, if applicable, the affected page URL.

## Reporting a security vulnerability

Do not open a public issue — see [SECURITY.md](SECURITY.md).

## Questions

Open a GitHub issue or discussion.
