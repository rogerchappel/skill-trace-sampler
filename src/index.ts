import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { parseTranscript } from './parser.js';
import type { SamplerOptions, TraceReport } from './types.js';

export async function sampleTrace(paths: string[], options: Partial<SamplerOptions> = {}): Promise<TraceReport> {
  const maxPerCategory = options.maxPerCategory ?? 3;
  const allSamples = [];
  const redactions = new Set<string>();
  const warnings = new Set<string>();

  for (const path of paths) {
    const text = await readFile(path, 'utf8');
    const parsed = parseTranscript(basename(path), text, maxPerCategory);
    allSamples.push(...parsed.samples);
    parsed.redactions.forEach((note) => redactions.add(note));
    parsed.warnings.forEach((warning) => warnings.add(`${basename(path)}: ${warning}`));
  }

  return {
    sources: paths.map((path) => basename(path)),
    generatedAt: options.now ?? '1970-01-01T00:00:00.000Z',
    sampleCount: allSamples.length,
    samples: allSamples,
    redactions: [...redactions].sort(),
    warnings: [...warnings].sort()
  };
}

export { toJson, toMarkdown } from './report.js';
export type { TraceReport, TraceSample, SamplerOptions } from './types.js';
