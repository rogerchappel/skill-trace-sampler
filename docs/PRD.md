# Skill Trace Sampler PRD

Status: in-progress
Created: 2026-07-11

## Summary

`skill-trace-sampler` is a local agent skill and CLI that turns noisy agent run
transcripts into small, reusable fixture packs for skill tests, demos, and
regression reviews.

## Problem

Agent builders repeatedly need realistic examples of tool calls, edits,
verification, blockers, approvals, and final claims. Raw transcripts are too
large and often contain private paths or accidental secrets, so teams either
skip fixture coverage or paste unsafe excerpts into docs.

## Target Users

- Maintainers packaging reusable agent skills.
- Agent operators building regression fixtures from real runs.
- OSS authors creating safe examples for docs and release-candidate PRs.

## V1 Scope

- Local-first TypeScript CLI with no network calls or telemetry.
- Parse plain text, JSONL, and markdown transcript snippets.
- Extract representative samples for commands, files, tool calls, approvals,
  blockers, verification lines, and final claims.
- Redact common token, email, and home-directory patterns by default.
- Emit deterministic JSON and Markdown fixture packs.
- Include `SKILL.md`, docs, fixtures, tests, smoke command, and validation.

## Non-Goals

- LLM-based judging or summarization.
- Uploading transcripts to hosted services.
- Vendor-specific private API integrations.
- Perfect transcript reconstruction.

## Acceptance Criteria

- `npm test`, `npm run check`, `npm run build`, `npm run smoke`, and
  `bash scripts/validate.sh` pass.
- README documents quickstart, examples, limits, and safety notes.
- `docs/PRD.md`, `docs/TASKS.md`, and `docs/ORCHESTRATION.md` exist.
- Public repo `rogerchappel/skill-trace-sampler` is created with one
  release-candidate PR.
