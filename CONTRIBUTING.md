# Contributing

Thanks for improving `skill-trace-sampler`.

## Local Checks

Run the full release-candidate gate before opening a pull request:

```bash
npm install
npm run release:check
```

For focused iteration:

```bash
npm run check
npm test
npm run smoke
npm run validate
npm run package:smoke
```

`npm test` is safe to run immediately after installation: it builds the
TypeScript sources before discovering and running the compiled test suite.

## Fixture Guidelines

- Keep transcript examples synthetic.
- Redact tokens, account IDs, emails, home paths, and private repository names.
- Prefer small fixtures that demonstrate one sampling behavior at a time.
