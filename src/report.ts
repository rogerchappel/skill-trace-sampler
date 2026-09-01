import type { TraceReport } from './types.js';

export function toJson(report: TraceReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function markdownText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/([`*_\[\]])/g, '\\$1');
}

export function toMarkdown(report: TraceReport): string {
  const lines = ['# Skill Trace Samples', '', `Sources: ${report.sources.map(markdownText).join(', ')}`, `Samples: ${report.sampleCount}`, ''];
  if (report.redactions.length) lines.push(`Redactions: ${report.redactions.map(markdownText).join(', ')}`, '');
  if (report.warnings.length) lines.push('## Warnings', '', ...report.warnings.map((warning) => `- ${markdownText(warning)}`), '');
  lines.push('## Samples', '');
  for (const sample of report.samples) {
    lines.push(`- **${sample.category}** ${markdownText(sample.source)}:${sample.line} - ${markdownText(sample.text)}`);
  }
  return `${lines.join('\n')}\n`;
}
