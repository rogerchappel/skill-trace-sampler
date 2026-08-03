import test from 'node:test';
import assert from 'node:assert/strict';
import { redactLine } from '../src/redact.js';

test('redacts supported home directory forms', () => {
  const cases = [
    '/Users/Alice/project/run.log',
    '/home/alice/project/run.log',
    String.raw`C:\Users\Alice\project\run.log`,
    'C:/Users/Alice/project/run.log'
  ];

  for (const input of cases) {
    assert.deepEqual(redactLine(`Updated ${input}`), {
      text: `Updated [REDACTED_HOME]${input.slice(input.indexOf('project') - 1)}`,
      notes: ['home-path']
    });
  }
});

test('does not redact paths that are not user home directories', () => {
  const cases = [
    String.raw`C:\UsersShared\Alice\project\run.log`,
    String.raw`C:\ProgramData\Users\Alice\project\run.log`,
    'C:/UsersShared/Alice/project/run.log',
    '/srv/Users/Alice/project/run.log'
  ];

  for (const input of cases) {
    assert.deepEqual(redactLine(`Updated ${input}`), {
      text: `Updated ${input}`,
      notes: []
    });
  }
});
