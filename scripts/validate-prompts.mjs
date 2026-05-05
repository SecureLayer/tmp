#!/usr/bin/env node
/**
 * Local prompt validation script — mirrors what the GitHub Actions workflow checks.
 * Run: npm run validate-prompts
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const PROMPTS_DIR = new URL('../src/content/prompts', import.meta.url).pathname;

const VALID_TIERS = ['free', 'basic', 'premium', 'tailored'];
const VALID_CATEGORIES = ['web-security', 'network-security', 'cloud-security', 'application-security', 'compliance', 'pentest'];
const VALID_EXPERTISE = ['beginner', 'intermediate', 'expert'];
const REQUIRED_FIELDS = ['id', 'title', 'tier', 'category', 'tags', 'tested', 'token_estimate', 'expertise'];

// Patterns that must never appear in prompt files
const FORBIDDEN_PATTERNS = [
  { pattern: /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}/i, label: 'API key' },
  { pattern: /password\s*[:=]\s*['"][^'"]{6,}/i, label: 'password' },
  { pattern: /secret\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}/i, label: 'secret' },
  { pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/, label: 'private key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: 'GitHub token' },
  { pattern: /sk-[a-zA-Z0-9]{32,}/, label: 'OpenAI key' },
];

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkDir(full));
    } else if (extname(full) === '.md') {
      files.push(full);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) fm[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

let errors = 0;
const files = walkDir(PROMPTS_DIR);

if (files.length === 0) {
  console.log('No prompt files found.');
  process.exit(0);
}

for (const file of files) {
  const rel = file.replace(PROMPTS_DIR + '/', '');
  const content = readFileSync(file, 'utf8');
  const fm = parseFrontmatter(content);

  if (!fm) {
    console.error(`[FAIL] ${rel}: missing or malformed frontmatter`);
    errors++;
    continue;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in fm)) {
      console.error(`[FAIL] ${rel}: missing required field "${field}"`);
      errors++;
    }
  }

  if (fm.tier && !VALID_TIERS.includes(fm.tier)) {
    console.error(`[FAIL] ${rel}: invalid tier "${fm.tier}". Must be one of: ${VALID_TIERS.join(', ')}`);
    errors++;
  }

  if (fm.category && !VALID_CATEGORIES.includes(fm.category)) {
    console.error(`[FAIL] ${rel}: invalid category "${fm.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    errors++;
  }

  if (fm.expertise && !VALID_EXPERTISE.includes(fm.expertise)) {
    console.error(`[FAIL] ${rel}: invalid expertise "${fm.expertise}". Must be one of: ${VALID_EXPERTISE.join(', ')}`);
    errors++;
  }

  if (fm.id && !/^[a-z0-9-]+$/.test(fm.id)) {
    console.error(`[FAIL] ${rel}: id must be kebab-case, got "${fm.id}"`);
    errors++;
  }

  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`[FAIL] ${rel}: potential ${label} detected — remove before committing`);
      errors++;
    }
  }

  if (errors === 0 || !errors) {
    // check per file — reset per file counter not needed, just log ok
  }
  console.log(`[ OK ] ${rel}`);
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found. Fix them before pushing.`);
  process.exit(1);
} else {
  console.log(`\nAll ${files.length} prompt(s) passed validation.`);
}
