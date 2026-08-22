import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

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
    'skill-trace-sampler <transcript...> [--format json|markdown] [--out path] [--max-per-category n]\n' +
      'skill-trace-sampler --help\n'
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

test('rejects an output path that is also an input without modifying it', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-trace-sampler-cli-'));
  const input = join(directory, 'input.log');
  const original = 'npm test\n';
  writeFileSync(input, original);

  const result = runCli([input, '--out', input]);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, `error: output path must not match an input path ${JSON.stringify(input)}\n`);
  assert.equal(readFileSync(input, 'utf8'), original);
});

test('rejects normalized input and output path collisions without modifying the input', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-trace-sampler-cli-'));
  const input = join(directory, 'input.log');
  const original = 'npm test\n';
  writeFileSync(input, original);

  const relativeInput = relative(process.cwd(), input);
  const equivalentOutput = join(relativeInput, '..', 'input.log');
  const result = runCli([relativeInput, '--out', equivalentOutput]);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(
    result.stderr,
    `error: output path must not match an input path ${JSON.stringify(equivalentOutput)}\n`
  );
  assert.equal(readFileSync(input, 'utf8'), original);
});

test('writes a report when the output path is distinct from every input', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-trace-sampler-cli-'));
  const input = join(directory, 'input.log');
  const output = join(directory, 'report.json');
  writeFileSync(input, 'npm test\n');

  const result = runCli([input, '--out', output]);

  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
  assert.equal(JSON.parse(readFileSync(output, 'utf8')).sources[0], 'input.log');
  assert.notEqual(resolve(input), resolve(output));
});

test('reports failure collisions as blockers in JSON output', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-trace-sampler-cli-'));
  const input = join(directory, 'failures.log');
  writeFileSync(input, 'Build failed after npm test\nPermission denied while publishing\n');

  const result = runCli([input, '--format', 'json']);

  assert.equal(result.status, 0);
  assert.deepEqual(
    JSON.parse(result.stdout).samples.map(({ category, line }: { category: string; line: number }) => ({ category, line })),
    [
      { category: 'blocker', line: 1 },
      { category: 'blocker', line: 2 }
    ]
  );
});

test('caps each category across all input transcripts', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-trace-sampler-cli-'));
  const first = join(directory, 'first.log');
  const second = join(directory, 'second.log');
  writeFileSync(first, 'npm test passed\n');
  writeFileSync(second, 'Build passed\n');

  const result = runCli([first, second, '--max-per-category', '1', '--format', 'json']);

  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.sampleCount, 1);
  assert.deepEqual(report.samples.map(({ category, source }: { category: string; source: string }) => ({ category, source })), [
    { category: 'verification', source: 'first.log' }
  ]);
});
