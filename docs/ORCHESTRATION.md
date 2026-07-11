# Orchestration

Use this skill after an agent run has finished and before examples are copied into
public docs, regression suites, or release-candidate PRs.

1. Save the transcript locally.
2. Run `skill-trace-sampler <transcript> --format markdown`.
3. Review redactions and sample categories.
4. Commit only the generated fixture pack, not the raw private transcript.

The CLI never performs network calls and never executes commands found in a
transcript.
