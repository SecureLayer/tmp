## Add Prompt — Checklist

**Prompt title:**
**Tier:** <!-- free / basic / premium / tailored -->
**Category:** <!-- web-security / network-security / cloud-security / application-security / compliance / pentest -->

### Before submitting

- [ ] File is in `src/content/prompts/<tier>/<kebab-case-id>.md`
- [ ] All required frontmatter fields are present (`id`, `title`, `tier`, `category`, `tags`, `tested`, `token_estimate`, `expertise`)
- [ ] `id` matches the filename (kebab-case, lowercase, no spaces)
- [ ] `tested: true` — I have run this prompt on at least one AI model and verified the output
- [ ] `tested_on` lists the model(s) used
- [ ] No API keys, passwords, secrets, or personal data in the prompt content
- [ ] Prompt uses `[REPLACE WITH ...]` placeholders for user-specific values
- [ ] Token estimate is realistic (run the prompt through a tokenizer)
- [ ] Local validation passes: `npm run validate-prompts`

### Testing notes

<!-- Which AI model(s) did you test with? What was the quality of the output? -->

### Security note

By submitting this PR you confirm the prompt content contains no secrets, credentials, or personally identifiable information.
