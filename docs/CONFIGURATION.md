# Configuration

V1 is flag-driven so fixture generation remains explicit in automation.

- `--format json|markdown` selects deterministic output.
- `--out <path>` writes a reviewed sample pack.
- `--max-per-category <n>` caps transcript excerpts per category across the
  combined report. Inputs and lines are considered in their supplied order.

`--format` accepts only `json` or `markdown`, and `--max-per-category` must be a
positive integer. Each scalar option may appear only once; repeating `--format`,
`--out`, or `--max-per-category` exits with status 2 before producing output.
Invalid or incomplete options exit with status 2. Input and output file errors
use the same status and do not expose internal stack traces.

Keep raw transcripts outside public repos. Commit only reviewed output.
