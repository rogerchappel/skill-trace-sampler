import { redactLine } from './redact.js';
import type { SampleCategory, TraceSample } from './types.js';

const RULES: Array<[SampleCategory, RegExp]> = [
  ['command', /(?:npm|pnpm|yarn|git|bash|node|python|pytest|cargo|go test)/],
  ['file', /(?:^|\s)(?:[\w.-]+\/)+[\w.-]+\.(?:ts|js|md|json|py|go|rs|yml|yaml)/],
  ['tool', /(?:tool|function|exec_command|apply_patch|read_mcp_resource|gh )/i],
  ['approval', /(?:approve|approval|permission|consent|confirm)/i],
  ['blocker', /(?:blocked|failed|error|cannot|timeout|denied)/i],
  ['verification', /(?:test|check|build|smoke|validate|passed|pass)/i],
  ['claim', /(?:done|implemented|fixed|created|updated|summary)/i]
];

export function parseTranscript(source: string, text: string, maxPerCategory: number): { samples: TraceSample[]; redactions: string[]; warnings: string[] } {
  const counts = new Map<SampleCategory, number>();
  const redactions = new Set<string>();
  const warnings: string[] = [];
  const samples: TraceSample[] = [];
  const lines = text.split(/?
/);

  lines.forEach((raw, index) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const redacted = redactLine(trimmed);
    redacted.notes.forEach((note) => redactions.add(note));
    for (const [category, pattern] of RULES) {
      if (!pattern.test(redacted.text)) continue;
      const current = counts.get(category) ?? 0;
      if (current >= maxPerCategory) continue;
      counts.set(category, current + 1);
      samples.push({ category, line: index + 1, text: redacted.text, source });
      break;
    }
  });

  if (!samples.some((sample) => sample.category === 'verification')) warnings.push('no verification sample found');
  if (!samples.some((sample) => sample.category === 'approval')) warnings.push('no approval boundary sample found');
  return { samples, redactions: [...redactions].sort(), warnings };
}
