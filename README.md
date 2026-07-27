# skill-trace-sampler

Turn completed agent transcripts into small, redacted fixture packs for reusable
agent skills, regression tests, demos, and release-candidate evidence.

## Quickstart

```bash
npm install
npm run build
node dist/src/cli.js examples/sample.txt --format markdown
```

## CLI

```bash
skill-trace-sampler run.log --format json
skill-trace-sampler traces/build/run.log traces/test/run.log --format json
skill-trace-sampler run.log --format markdown --out samples.md
skill-trace-sampler run.log --max-per-category 2
```

Source labels use the basename when it is unique. If multiple input paths share
a basename, reports use the shortest unique path suffix (for example,
`build/run.log` and `test/run.log`). Repeated identical paths receive stable
`#1`, `#2` suffixes. The same labels appear in source lists, samples, warnings,
and Markdown output without unnecessarily exposing full absolute paths.

Invalid options, missing option values, and unreadable input files exit with
status 2 and print a concise `error:` message to stderr. Use `--help` to print
the command synopsis.

## What It Extracts

- command lines and tool-use mentions
- edited file paths
- approval and consent boundaries
- blocker or failure lines
- verification evidence
- final implementation claims

## Safety Notes

The tool is local-only. It reads only paths passed on the command line and never
executes commands found in a transcript. It redacts common token, email, and home
path patterns, but humans should still inspect outputs before publishing them.

## Limitations

Sampling is deterministic and heuristic. It is meant to create useful fixtures,
not to judge agent quality or reconstruct a full run.

## Release Verification

```bash
npm run release:check
npm pack --dry-run
```

The release check runs type checks, tests, CLI smoke coverage, fixture validation,
and a package smoke that asserts the CLI, examples, docs, README, license,
security policy, changelog, and contributor guide are present in the npm tarball.
