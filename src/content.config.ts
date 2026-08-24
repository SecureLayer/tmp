import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const prompts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/prompts' }),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
    title: z.string().min(10).max(120),
    tier: z.enum(['free', 'basic', 'premium', 'tailored']),
    category: z.enum([
      'web-security',
      'network-security',
      'cloud-security',
      'application-security',
      'compliance',
      'pentest',
    ]),
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(10),
    tested: z.boolean(),
    tested_on: z.array(z.string()).optional(),
    token_estimate: z.number().int().min(50).max(2000),
    expertise: z.enum(['beginner', 'intermediate', 'expert']),
    published: z.boolean().default(true),
  }),
});

export const collections = { prompts };
