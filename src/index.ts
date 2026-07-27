import { readFile } from 'node:fs/promises';
import { parseTranscript } from './parser.js';
import { createSourceLabels } from './source-labels.js';
import type { SamplerOptions, TraceReport } from './types.js';

export async function sampleTrace(paths: string[], options: Partial<SamplerOptions> = {}): Promise<TraceReport> {
  const maxPerCategory = options.maxPerCategory ?? 3;
  const allSamples = [];
  const redactions = new Set<string>();
  const warnings = new Set<string>();
  const sources = createSourceLabels(paths);

  for (const [index, path] of paths.entries()) {
    const source = sources[index];
    const text = await readFile(path, 'utf8');
    const parsed = parseTranscript(source, text, maxPerCategory);
    allSamples.push(...parsed.samples);
    parsed.redactions.forEach((note) => redactions.add(note));
    parsed.warnings.forEach((warning) => warnings.add(`${source}: ${warning}`));
  }

  return {
    sources,
    generatedAt: options.now ?? '1970-01-01T00:00:00.000Z',
    sampleCount: allSamples.length,
    samples: allSamples,
    redactions: [...redactions].sort(),
    warnings: [...warnings].sort()
  };
}

export { toJson, toMarkdown } from './report.js';
export type { TraceReport, TraceSample, SamplerOptions } from './types.js';
