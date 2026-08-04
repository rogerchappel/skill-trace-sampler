import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTranscript } from '../src/parser.js';
import { toMarkdown } from '../src/report.js';
import type { TraceReport } from '../src/types.js';

test('samples documented command tokens without case sensitivity', () => {
  const parsed = parseTranscript('commands.log', [
    'NPM install',
    'PnPm install',
    'YARN install',
    'GiT status',
    'BASH script.sh',
    'NoDe script.js',
    'PYTHON script.py',
    'PyTeSt',
    'CARGO build',
    'Go TeSt ./...'
  ].join('\n'), 20);

  assert.deepEqual(parsed.samples.map(({ category, line }) => ({ category, line })), [
    { category: 'command', line: 1 },
    { category: 'command', line: 2 },
    { category: 'command', line: 3 },
    { category: 'command', line: 4 },
    { category: 'command', line: 5 },
    { category: 'command', line: 6 },
    { category: 'command', line: 7 },
    { category: 'command', line: 8 },
    { category: 'verification', line: 9 },
    { category: 'verification', line: 10 }
  ]);
});

test('samples POSIX and Windows file paths while rejecting near-miss prose', () => {
  const parsed = parseTranscript('paths.log', [
    'Edited src/index.ts',
    'Edited ./src/index.ts',
    'Edited ../docs/guide.md',
    'Edited /opt/project/src/index.ts',
    String.raw`Edited src\index.ts`,
    String.raw`Edited .\src\index.ts`,
    String.raw`Edited C:\project\src\index.ts`,
    'The release notes are ready',
    'Mention index.ts without a directory',
    'Mention src/index.txt with an unsupported extension',
    'Mention http://example.com/docs/guide.md'
  ].join('\n'), 20);

  assert.deepEqual(parsed.samples.map(({ category, line }) => ({ category, line })), [
    { category: 'file', line: 1 },
    { category: 'file', line: 2 },
    { category: 'file', line: 3 },
    { category: 'file', line: 4 },
    { category: 'file', line: 5 },
    { category: 'file', line: 6 },
    { category: 'file', line: 7 }
  ]);
});

test('preserves category precedence in rendered reports', () => {
  const parsed = parseTranscript('mixed.log', 'NPM test src\\index.ts\nApproval confirmed', 3);
  const report: TraceReport = {
    generatedAt: '2026-08-04T00:00:00.000Z',
    sources: ['mixed.log'],
    sampleCount: parsed.samples.length,
    samples: parsed.samples,
    redactions: parsed.redactions,
    warnings: parsed.warnings
  };

  assert.equal(parsed.samples[0]?.category, 'verification');
  assert.match(toMarkdown(report), /\*\*verification\*\* mixed\.log:1 - NPM test src\\index\.ts/);
  assert.doesNotMatch(toMarkdown(report), /\*\*(?:command|file)\*\* mixed\.log:1/);
});
