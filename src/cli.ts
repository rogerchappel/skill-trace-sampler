#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { sampleTrace, toJson, toMarkdown } from './index.js';

function usage(): string {
  return `skill-trace-sampler <transcript...> [--format json|markdown] [--out path] [--max-per-category n]
`;
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.length === 0) {
  process.stdout.write(usage());
  process.exit(0);
}

let format: 'json' | 'markdown' = 'json';
let out: string | undefined;
let maxPerCategory = 3;
const paths: string[] = [];
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--format') format = args[++i] as 'json' | 'markdown';
  else if (arg === '--out') out = args[++i];
  else if (arg === '--max-per-category') maxPerCategory = Number(args[++i]);
  else paths.push(arg);
}

if (!paths.length || !Number.isInteger(maxPerCategory) || maxPerCategory < 1) {
  process.stderr.write(usage());
  process.exit(2);
}

const report = await sampleTrace(paths, { maxPerCategory, now: new Date(0).toISOString() });
const rendered = format === 'markdown' ? toMarkdown(report) : toJson(report);
if (out) await writeFile(out, rendered, 'utf8');
else process.stdout.write(rendered);
