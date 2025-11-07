# Contributing to Oko

Oko prioritizes **correctness** and **reliability**. Small, well-tested PRs are
easier to review and ship.

## Ground rules

- Follow existing **validation/testing patterns**.
- Keep PRs **small and focused**; avoid mixing unrelated changes.
- Update docs and examples when behavior changes.

## Quick start

```bash
# 1) Fork and clone
git clone https://github.com/chainapsis/oko.git
cd oko

# 2) Install & run & CI
#    See https://docs.oko.app/docs/v0/standalone/self-hosting-standalone for setup and execution steps.
```

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

1. scope: A package or module that is most relevant to the commit. Please choose
   one that you think is the most helpful to convey your intent of the commit
   message. e.g., `crypto`, `demo_web`.
2. Commit message title of length equal to or less than 80 characters.
