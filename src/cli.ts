#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sampleTrace, toJson, toMarkdown } from './index.js';

function usage(): string {
  return `skill-trace-sampler <transcript...> [--format json|markdown] [--out path] [--max-per-category n]
skill-trace-sampler --help
`;
}

function fail(message: string): never {
  process.stderr.write(`error: ${message}\n`);
  process.exit(2);
}

function errorPath(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'path' in error
    ? String(error.path)
    : undefined;
}

const args = process.argv.slice(2);
if (args.includes('--help') && args.length > 1) {
  fail('--help must be used alone');
}
if (args.length === 0 || args[0] === '--help') {
  process.stdout.write(usage());
  process.exit(0);
}

let format: 'json' | 'markdown' = 'json';
let out: string | undefined;
let maxPerCategory = 3;
const paths: string[] = [];

function optionValue(option: string, index: number): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--')) {
    fail(`${option} requires a value`);
  }
  return value;
}

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--format') {
    const value = optionValue(arg, i);
    if (value !== 'json' && value !== 'markdown') {
      fail('--format must be one of: json, markdown');
    }
    format = value;
    i += 1;
  } else if (arg === '--out') {
    out = optionValue(arg, i);
    i += 1;
  } else if (arg === '--max-per-category') {
    maxPerCategory = Number(optionValue(arg, i));
    i += 1;
  } else if (arg.startsWith('--')) fail(`unknown option ${JSON.stringify(arg)}`);
  else paths.push(arg);
}

if (!paths.length) fail('at least one transcript path is required');
if (!Number.isInteger(maxPerCategory) || maxPerCategory < 1) {
  fail('--max-per-category must be a positive integer');
}
if (out && paths.some((path) => resolve(path) === resolve(out))) {
  fail(`output path must not match an input path ${JSON.stringify(out)}`);
}

let report;
try {
  report = await sampleTrace(paths, { maxPerCategory, now: new Date(0).toISOString() });
} catch (error) {
  const path = errorPath(error);
  fail(path ? `unable to read input ${JSON.stringify(path)}` : 'unable to process transcripts');
}

const rendered = format === 'markdown' ? toMarkdown(report) : toJson(report);
if (out) {
  try {
    await writeFile(out, rendered, 'utf8');
  } catch (error) {
    fail(`unable to write output ${JSON.stringify(errorPath(error) ?? out)}`);
  }
} else {
  process.stdout.write(rendered);
}
