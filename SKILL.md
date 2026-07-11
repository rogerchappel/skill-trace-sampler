# Skill Trace Sampler

Use this skill when an agent builder needs safe, representative examples from a
completed agent run for `SKILL.md` examples, regression fixtures, demos, or PR
evidence.

## Inputs

- Plain text transcript, JSONL transcript, or markdown run notes.
- Optional `--max-per-category` to keep the pack small.

## Side-Effect Boundaries

- Reads only the files passed on the command line.
- Writes only when `--out <path>` is provided.
- Does not call external services, execute transcript commands, or inspect live
  accounts.

## Approval Requirements

No approval is required for local parsing. Approval is required before sharing
sample output outside the workspace, because transcripts may include sensitive
context even after redaction.

## Validation

Run `npm test`, `npm run smoke`, and inspect the generated redaction notes before
using samples in public artifacts.
