import test from 'node:test';
import assert from 'node:assert/strict';
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
