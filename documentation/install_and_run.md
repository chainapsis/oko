# Install and run

Shell scripts for local development environment setup and E2E testing.

## Prerequisites

- Node.js 22+
- tmux
- Rust (optional, for cargo check)

## Scripts

### ci-setup.sh

Sets up the local development environment by running the same build steps as
GitHub CI.

```bash
./internals/ci/ci-setup.sh [OPTIONS]
```

**Build Steps:**

1. Check Node.js version (22+)
2. Enable corepack
3. Install dependencies (`yarn install --immutable`)
4. Build CS packages (cait-sith WASM)
5. Build Frost packages (frost-ed25519 WASM)
6. Build internal packages
7. Build SDK packages
8. Run TypeScript typecheck
9. Run Rust cargo check

**Options:**

| Option             | Description               |
| ------------------ | ------------------------- |
| `--skip-rust`      | Skip Rust cargo check     |
| `--skip-typecheck` | Skip TypeScript typecheck |
| `-h, --help`       | Show help message         |

**Examples:**

```bash
# Full setup
./internals/ci/ci-setup.sh

# Quick setup (skip checks)
./internals/ci/ci-setup.sh --skip-rust --skip-typecheck
```

---

## Typical Workflow

If you are not familiar with "tmux", please refer to the document at
`internals/tmux/README.md`.

**First time setup (fresh clone):**

```bash
./internals/ci/ci-setup.sh
./internals/tmux/tmux-e2e-start.sh --reset
```

**Already set up, just start services:**

```bash
./internals/tmux/tmux-e2e-start.sh
```

**Stop all services:**

```bash
./internals/tmux/tmux-e2e-stop.sh
```
