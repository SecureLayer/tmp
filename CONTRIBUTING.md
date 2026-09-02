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
- **Reviewed and approved** — every PR needs an approving review from a maintainer listed in [`.github/CODEOWNERS`](.github/CODEOWNERS); this is enforced by branch protection on `main` and cannot be bypassed by admins.
- **One focused change per PR** — unrelated fixes should be separate pull requests.
- **No secrets or credentials** — GitHub push protection will block these, but don't rely on it as your only check.
- **Accurate, working links and content** — anything user-facing must be verified, not assumed.
- **Every non-merge commit must be signed off (DCO)** — see below; set up the hook once and it's automatic.
- **New functionality gets a test** — if a PR adds major new functionality (a new page, a new build step, a new script), add or extend an automated test covering it in `scripts/` and wire it into `npm test`. Content-only fixes (typos, copy changes) don't require one.
- **Follow the project's code style** — formatting is enforced by [Prettier](https://prettier.io) (config in `.prettierrc.json`). Run `npm run format` before committing, or `npm run format:check` to verify without changing files.

PRs that don't meet these will be asked for changes before review, not merged as-is.

## Developer Certificate of Origin (DCO)

Every non-merge commit must include a `Signed-off-by` trailer certifying you wrote it or otherwise have the right to submit it under this project's [AGPL-3.0-only license](LICENSE), per the [Developer Certificate of Origin](https://developercertificate.org/). The `DCO` check runs on every pull request and blocks merge if any real commit is missing it. Merge commits are exempt (they introduce no authored content).

**Set this up once per clone so you never have to think about it:**

```sh
git config core.hooksPath .githooks   # auto-adds Signed-off-by to every commit
git config pull.rebase true           # update branches by rebase, not merge commits
```

The [`.githooks/prepare-commit-msg`](.githooks/prepare-commit-msg) hook appends `Signed-off-by: Your Name <you@example.com>` from your git identity to each commit (idempotent — no duplicates). With `pull.rebase true`, keeping a branch current is `git pull` / `git fetch && git rebase origin/main`, which keeps history linear and avoids merge commits entirely.

Fixing commits made before you set the hook up: `git commit --amend -s` (last commit) or `git rebase --signoff origin/main` (a whole branch).

## Reporting bugs or inaccurate content

Open a GitHub issue with a clear description of the problem and, if applicable, the affected page URL.

## Reporting a security vulnerability

Do not open a public issue — see [SECURITY.md](SECURITY.md).

## Questions

Open a GitHub issue or discussion.
