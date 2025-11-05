---
title: Contributing
sidebar_position: 45
---

Use this page to get started contributing to Oko. For the full set of rules and
best practices, follow the repository root [`CONTRIBUTING.md`](https://github.com/chainapsis/oko/blob/main/CONTRIBUTING.md).

## What can I contribute and how?

1. Keep PRs small and focused. If changes are logically independent, split them
   into separate PRs to make review and release easier.
2. Update docs/examples along with code changes. If SDK usage or API behavior
   changes, update `docs` and `examples` together.
3. Ensure tests and static checks pass. Strengthen unit/integration tests for
   new or changed logic, and follow Biome formatting/linting rules. Editor
   setup: [VSCode/IntelliJ/Zed (first‑party)](https://biomejs.dev/guides/editors/first-party-extensions/),
   [Other editors (third‑party)](https://biomejs.dev/guides/editors/third-party-extensions/).

## Run locally (development)

### Docs-only changes

If you’re only editing documentation, you don’t need to run all services.

```bash
# Install workspace dependencies at the repo root
yarn install

# Launch the docs web (port 3205)
cd apps/docs_web
yarn start
```

Open `http://localhost:3205` to preview your changes.

### Code/service changes (Standalone environment)

To run all services (backend/SDK/apps) together locally, prepare the development
environment with the Standalone guide first.

- Environment setup and boot order: [Standalone guide](./standalone/self-hosting-standalone)

Once completed, required services (e.g., Postgres, API, Key Share Node) and
web/SDK can run locally and be wired together for development.

## Typical workflow

1. Pick an issue and create a branch (e.g., `issue/123-scope-title`).
2. Commit in small steps and update related tests/docs together.
3. Make sure tests/formatting pass locally, then open a PR.
4. Address review feedback and merge.

## Notes

- For security issues, please don’t open public issues. See the root
  [`SECURITY.md`](https://github.com/chainapsis/oko/blob/main/SECURITY.md) for the responsible disclosure process.
