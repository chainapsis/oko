# Contributing to Oko

Oko prioritizes **correctness** and **reliability**. Small, well-tested PRs are
easier to review and ship.

## Ground rules

- Follow existing **validation/testing patterns**.
- Keep PRs **small and focused**; avoid mixing unrelated changes.
- Update docs and examples when behavior changes.

## Development guide

See https://docs.oko.app/docs/v0/development/environment-setup for local setup
and tooling.

## Tests

- Cover new/changed logic with unit/integration tests.
- Run locally and ensure CI is green.

## Linting & style

- Oko uses a number of code formatters including _Biome_, _Prettier_, and
  _rust_analyzer_.

## Security

Please **do not** open public issues for security vulnerabilities. See
`SECURITY.md`.

## Commit message convention

In most cases, the commit message should be structured as follows:

```
<scope>: <description>
```

1. **scope**: A package or module that is most relevant to the commit. Please
   choose one that you think is the most helpful to convey your intent of the
   commit message. e.g., `crypto`, `demo_web`.
2. **description**: A phrase that starts with a lowercase letter (adn often
   verb).
3. Commit message title is of length equal to or less than 80 characters.
