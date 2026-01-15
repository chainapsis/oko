# Install and Run

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

### tmux-e2e-start.sh

Starts all E2E services in a single tmux window with 6 panes (tiled layout).

```bash
./internals/tmux/tmux-e2e-start.sh [OPTIONS]
```

**Tmux Session Structure:**

Session name: `oko-e2e`

```
oko-e2e (session)
└── services (window)
    ├── pane 0: oko_api      → backend/oko_api/server     (yarn dev)
    ├── pane 1: oko_attached → embed/oko_attached         (yarn dev)
    ├── pane 2: demo_web     → apps/demo_web              (yarn dev)
    ├── pane 3: ksn_1        → key_share_node/server      (yarn start)
    ├── pane 4: ksn_2        → key_share_node/server      (yarn start_2)
    └── pane 5: ksn_3        → key_share_node/server      (yarn start_3)
```

**Pane Layout (tiled 2x3 grid):**

```
+------------+------------+
| oko_api    | oko_attach |
+------------+------------+
| demo_web   | ksn_1      |
+------------+------------+
| ksn_2      | ksn_3      |
+------------+------------+
```

**Services:**

| Pane | Service          | Directory                | Command        |
| ---- | ---------------- | ------------------------ | -------------- |
| 0    | Backend API      | backend/oko_api/server   | `yarn dev`     |
| 1    | Embedded wallet  | embed/oko_attached       | `yarn dev`     |
| 2    | Demo web app     | apps/demo_web            | `yarn dev`     |
| 3    | Key Share Node 1 | key_share_node/server    | `yarn start`   |
| 4    | Key Share Node 2 | key_share_node/server    | `yarn start_2` |
| 5    | Key Share Node 3 | key_share_node/server    | `yarn start_3` |

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
./internals/tmux/tmux-e2e-start.sh

# Reset database and start
./internals/tmux/tmux-e2e-start.sh --reset
```

---

### tmux-e2e-stop.sh

Stops the E2E tmux session.

```bash
./internals/tmux/tmux-e2e-stop.sh
```

---

## Typical Workflow

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

---

## Tmux Pane Navigation

Once attached to the session:

| Shortcut       | Action                                      |
| -------------- | ------------------------------------------- |
| `Ctrl+b o`     | Move to next pane                           |
| `Ctrl+b ;`     | Move to previous pane                       |
| `Ctrl+b q`     | Show pane numbers, then press number to go  |
| `Ctrl+b z`     | Toggle current pane fullscreen (zoom)       |
| `Ctrl+b d`     | Detach from session (services keep running) |
| `Ctrl+b arrow` | Move to pane in arrow direction             |
