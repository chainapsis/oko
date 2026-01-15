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
./scripts/ci-setup.sh [OPTIONS]
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
./scripts/ci-setup.sh

# Quick setup (skip checks)
./scripts/ci-setup.sh --skip-rust --skip-typecheck
```

---

### tmux-e2e-start.sh

Starts all E2E services in a tmux session with separate windows.

```bash
./scripts/tmux-e2e-start.sh [OPTIONS]
```

**Services Started:**

| Window       | Service          | Command        |
| ------------ | ---------------- | -------------- |
| oko_api      | Backend API      | `yarn dev`     |
| oko_attached | Embedded wallet  | `yarn dev`     |
| demo_web     | Demo web app     | `yarn dev`     |
| ksn_1        | Key Share Node 1 | `yarn start`   |
| ksn_2        | Key Share Node 2 | `yarn start_2` |
| ksn_3        | Key Share Node 3 | `yarn start_3` |

**Options:**

| Option       | Description                                               |
| ------------ | --------------------------------------------------------- |
| `--reset`    | Reset database before starting (runs migrations and seed) |
| `-h, --help` | Show help message                                         |

**Database Reset Steps (when using `--reset`):**

1. `yarn ci db_migrate_api --use-env-file`
2. `yarn ci db_seed_api --use-env-file`
3. `yarn ci db_migrate_ksn --use-env-file`

**Examples:**

```bash
# Start services
./scripts/tmux-e2e-start.sh

# Reset database and start
./scripts/tmux-e2e-start.sh --reset
```

---

### tmux-e2e-stop.sh

Stops the E2E tmux session.

```bash
./scripts/tmux-e2e-stop.sh
```

---

## Typical Workflow

```bash
# 1. First time setup (run once)
./scripts/ci-setup.sh

# 2. Start E2E environment with fresh database
./scripts/tmux-e2e-start.sh --reset

# 3. When done, stop all services
./scripts/tmux-e2e-stop.sh
```

## Tmux Navigation

Once attached to the session:

- `Ctrl+b n` - Next window
- `Ctrl+b p` - Previous window
- `Ctrl+b <number>` - Go to window by number (0-5)
- `Ctrl+b d` - Detach from session (services keep running)
- `Ctrl+b w` - List all windows
