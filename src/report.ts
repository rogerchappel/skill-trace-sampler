import type { TraceReport } from './types.js';

export function toJson(report: TraceReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function toMarkdown(report: TraceReport): string {
  const lines = ['# Skill Trace Samples', '', `Sources: ${report.sources.join(', ')}`, `Samples: ${report.sampleCount}`, ''];
  if (report.redactions.length) lines.push(`Redactions: ${report.redactions.join(', ')}`, '');
  if (report.warnings.length) lines.push('## Warnings', '', ...report.warnings.map((warning) => `- ${warning}`), '');
  lines.push('## Samples', '');
  for (const sample of report.samples) {
    lines.push(`- **${sample.category}** ${sample.source}:${sample.line} - ${sample.text}`);
  }
  return `${lines.join('\n')}\n`;
}
