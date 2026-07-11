# skill-trace-sampler

Turn completed agent transcripts into small, redacted fixture packs for reusable
agent skills, regression tests, demos, and release-candidate evidence.

## Quickstart

```bash
npm install
npm run build
node dist/cli.js examples/sample.txt --format markdown
```

## CLI

```bash
skill-trace-sampler run.log --format json
skill-trace-sampler run.log --format markdown --out samples.md
skill-trace-sampler run.log --max-per-category 2
```

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
