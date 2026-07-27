import test from 'node:test';
import assert from 'node:assert/strict';
import { createSourceLabels } from '../src/source-labels.js';

test('keeps basenames when they identify sources uniquely', () => {
  assert.deepEqual(
    createSourceLabels(['/private/traces/build.log', '/private/traces/test.log']),
    ['build.log', 'test.log']
  );
});

test('uses the shortest unique suffix for colliding basenames', () => {
  assert.deepEqual(
    createSourceLabels(['/private/trace-a/run.log', '/private/trace-b/run.log']),
    ['trace-a/run.log', 'trace-b/run.log']
  );
});

test('numbers repeated identical paths deterministically', () => {
  assert.deepEqual(
    createSourceLabels(['/private/traces/run.log', '/private/traces/run.log']),
    ['run.log#1', 'run.log#2']
  );
});
