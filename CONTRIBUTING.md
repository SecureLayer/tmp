# Contributing to SecureLayer

Thank you for helping improve cybersecurity prompt quality for everyone.

## Ways to contribute

- Add a new cybersecurity prompt
- Improve an existing prompt (accuracy, token efficiency, coverage)
- Report a bug or inaccurate security advice via a GitHub issue
- Improve site code or CI pipeline

## Prompt submission requirements

All prompt submissions **must** meet every requirement below before they will be merged:

1. **File location** — `src/content/prompts/<tier>/<kebab-case-id>.md`
2. **Required frontmatter fields** — `id`, `title`, `tier`, `category`, `tags`, `tested`, `tested_on`, `token_estimate`, `expertise`, `published`
3. **ID format** — kebab-case, lowercase, no spaces; must exactly match the filename
4. **Tested** — `tested: true` only if you have personally run the prompt on at least one AI model and verified the output is technically accurate and safe to follow
5. **No secrets** — no API keys, passwords, credentials, personal data, or real hostnames/IPs
6. **Placeholders** — all user-specific values use `[REPLACE — description]` format
7. **Accuracy** — security advice must follow current best practices; outdated or dangerous advice will be rejected
8. **Token estimate** — must be realistic; run your prompt through a tokenizer before submitting

## Submission process

1. Fork the repository
2. Create a branch: `git checkout -b prompt/your-prompt-name`
3. Add your prompt file following the requirements above
4. Run local validation: `npm run validate-prompts`
5. Open a pull request using the provided template and complete the checklist
6. CI will automatically validate schema, scan for secrets, and run a full build

PRs that do not pass CI or that skip the checklist will not be reviewed until fixed.

## Code contributions

- Follow existing patterns and code style
- One concern per pull request
- Run `npm run build` before opening a PR and confirm it passes with no errors

## Reporting bugs or inaccurate security advice

Open a GitHub issue with:
- A clear description of the problem
- The affected prompt ID (if applicable)
- Steps to reproduce or evidence the advice is incorrect

## Questions

Open a GitHub issue or discussion.
