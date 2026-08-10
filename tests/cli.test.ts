import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function runCli(args: string[]) {
  return spawnSync(process.execPath, ['dist/src/cli.js', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

test('prints usage when help is the only argument', () => {
  const result = runCli(['--help']);

  assert.equal(result.status, 0);
  assert.equal(
    result.stdout,
    'skill-trace-sampler <transcript...> [--format json|markdown] [--out path] [--max-per-category n]\n'
  );
  assert.equal(result.stderr, '');
});

test('rejects help combined with other arguments', () => {
  for (const args of [
    ['--help', '--unknown'],
    ['--unknown', '--help'],
    ['examples/sample.txt', '--help']
  ]) {
    const result = runCli(args);

    assert.equal(result.status, 2, args.join(' '));
    assert.equal(result.stdout, '', args.join(' '));
    assert.equal(result.stderr, 'error: --help must be used alone\n', args.join(' '));
  }
});

test('rejects unsupported output formats', () => {
  const result = runCli(['examples/sample.txt', '--format', 'yaml']);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, 'error: --format must be one of: json, markdown\n');
});

test('rejects unknown options', () => {
  const result = runCli(['examples/sample.txt', '--colour']);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, 'error: unknown option "--colour"\n');
});

test('reports missing option values without consuming another option', () => {
  for (const args of [
    ['examples/sample.txt', '--format'],
    ['examples/sample.txt', '--format', '--out', 'samples.md'],
    ['examples/sample.txt', '--out'],
    ['examples/sample.txt', '--max-per-category']
  ]) {
    const result = runCli(args);

    assert.equal(result.status, 2, args.join(' '));
    assert.equal(result.stdout, '', args.join(' '));
    assert.match(result.stderr, /^error: --[\w-]+ requires a value\n$/, args.join(' '));
    assert.doesNotMatch(result.stderr, /\n\s+at /, args.join(' '));
  }
});

test('reports unreadable input files without an internal stack trace', () => {
  const result = runCli(['does-not-exist.txt']);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, 'error: unable to read input "does-not-exist.txt"\n');
  assert.doesNotMatch(result.stderr, /\n\s+at /);
});
