# Verification Log

Run date: 2026-07-11

## Commands

- `npm install`: passed, 0 vulnerabilities
- `npm run check`: passed
- `npm run build`: passed
- `npm test`: passed, 1 test
- `npm run smoke`: passed
- `bash scripts/validate.sh`: passed

## Smoke Evidence

`npm run smoke` prints CLI help and renders `examples/sample.txt` as Markdown.
The sample output includes command, file, verification, approval, and claim
samples, with email, home path, and GitHub-style token redactions.

