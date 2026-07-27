import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { sampleTrace, toMarkdown } from '../src/index.js';

test('samples and redacts transcript evidence', async () => {
  const report = await sampleTrace(['examples/sample.txt'], { now: '2026-07-11T00:00:00.000Z' });
  assert.equal(report.sources[0], 'sample.txt');
  assert.ok(report.samples.some((sample) => sample.category === 'approval'));
  assert.ok(report.samples.some((sample) => sample.category === 'verification'));
  assert.ok(report.redactions.includes('email'));
  assert.ok(report.redactions.includes('home-path'));
  assert.ok(report.redactions.includes('token'));
  assert.match(toMarkdown(report), /Skill Trace Samples/);
});

test('uses unambiguous source labels throughout reports', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'skill-trace-sampler-'));
  const first = join(directory, 'trace-a', 'run.log');
  const second = join(directory, 'trace-b', 'run.log');

  try {
    await mkdir(join(directory, 'trace-a'));
    await mkdir(join(directory, 'trace-b'));
    await writeFile(first, 'Tests passed\n');
    await writeFile(second, 'Approval confirmed\n');

    const report = await sampleTrace([first, second]);

    assert.deepEqual(report.sources, ['trace-a/run.log', 'trace-b/run.log']);
    assert.deepEqual(
      report.samples.map((sample) => sample.source),
      ['trace-a/run.log', 'trace-b/run.log']
    );
    assert.deepEqual(report.warnings, [
      'trace-a/run.log: no approval boundary sample found',
      'trace-b/run.log: no verification sample found'
    ]);
    const markdown = toMarkdown(report);
    assert.match(markdown, /Sources: trace-a\/run\.log, trace-b\/run\.log/);
    assert.match(markdown, /\*\*verification\*\* trace-a\/run\.log:1/);
    assert.match(markdown, /\*\*approval\*\* trace-b\/run\.log:1/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
