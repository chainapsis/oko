---
title: Self-Hosting Guide
---

## Overview

This guide explains how to self-host Oko in a standalone setup. It covers how to run each service locally or on servers and the recommended boot order.

## Components (to run)

- keyshare node: `oko/key_share_node` — stores/returns user key shares
- oko_api: `oko/backend/ewallet_api/server` — customers/wallets/keyshare node meta, login/JWT
- oko_attached (embedded app): `oko/embed/ewallet_attached` — an independent app served in an iframe (not a traditional UI "widget")
- Apps: `oko/apps`
  - demo_web (for testing)
  - customer_dashboard
  - oko_admin_web

## Default Ports (customizable)

- keyshare node: 4201 (node 1), 4202 (node 2), 4203 (node 3, optional)
- oko_api: 4200
- demo_web: 3200
- oko_attached: 3201
- customer_dashboard: 3203
- oko_admin_web: 3204

## Prerequisites

- Node 22 + Yarn 4
- Docker + Docker Compose (recommended for keyshare node in production)
- PostgreSQL 17+ (separate DBs for keyshare node and oko_api; or separate DB names on the same server)

## Clone the Repository

```
git clone https://github.com/chainapsis/oko.git
cd oko
```

## Install/Build

```
cd oko && yarn && yarn workspaces foreach -p run build
```

## keyshare node

Option A — Docker Compose (recommended)

```
cd oko/key_share_node/docker
cp env.example .env
```

1. **Create encryption secret file** (32-byte hex string, you can use any random value):

```bash
# Example encryption secret (32-byte hex string)
echo "f7e2a9c4b8d1e6f3a5c7b9d2e4f6a8c1b3d5e7f9a2c4b6d8e1f3a5c7b9d2e4f6a8" > /opt/key_share_node/encryption_secret.txt
chmod 600 /opt/key_share_node/encryption_secret.txt
```

2. **Create required directories and set proper permissions**:

```bash
# Create directories for data persistence
sudo mkdir -p /opt/key_share_node/pg_data /opt/key_share_node/dump /opt/key_share_node/logs

# Set proper permissions for Node.js user (UID:1000, GID:1000)
# DUMP_DIR and LOG_DIR must be writable by the container's Node.js user
sudo chown -R 1000:1000 /opt/key_share_node/dump /opt/key_share_node/logs
```

3. **Edit `.env` file** with your configuration:

```bash
# Database Configuration
DB_USER=postgres                    # PostgreSQL database username
DB_PASSWORD=your_secure_password    # PostgreSQL database password
DB_NAME=key_share_node              # PostgreSQL database name
PG_DATA_DIR=/opt/key_share_node/pg_data  # Host directory for PostgreSQL data persistence
DUMP_DIR=/opt/key_share_node/dump    # Host directory for database dump files (must be writable by UID:1000/GID:1000)
LOG_DIR=/opt/key_share_node/logs     # Host directory for log files (must be writable by UID:1000/GID:1000)

# Server Configuration
SERVER_PORT=4201                     # Port number for the Key Share Node server
ADMIN_PASSWORD=admin_password       # Admin password for database dump/restore operations
ENCRYPTION_SECRET_FILE_PATH=/opt/key_share_node/encryption_secret.txt  # Host file path to encryption secret
```

4. **Start the services**:

```bash
docker compose up -d
```

5. **Verify the services are running**:

```bash
docker compose ps
curl http://localhost:4201/status
```

Option B — Local (dev, multi-node)

```
cd oko
# Generate env files for nodes 1/2/3 under ~/.oko and a temp encryption secret file
yarn workspace @oko-wallet/key-share-node-server create_env

# PostgreSQL (example via Docker)
docker run --name ksnode-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:17

# Node 1 (port 4201)
yarn workspace @oko-wallet/key-share-node-server start
# Node 2 (port 4202)
yarn workspace @oko-wallet/key-share-node-server start_2
# (Optional) Node 3 (port 4203)
yarn workspace @oko-wallet/key-share-node-server start_3
```

Health check: `curl http://localhost:4201/status`

## oko_api (backend)

```
cd oko
# Create env under ~/.oko/ewallet_api_server.env
yarn workspace @oko-wallet/ewallet-api-server create_env
# Configure DB_* (host/port/dbname), ENCRYPTION_SECRET, SMTP*, JWT*

# Migrate/seed using env
USE_ENV=true yarn workspace @oko-wallet/ewallet-pg-interface migrate
USE_ENV=true TARGET=dev yarn workspace @oko-wallet/ewallet-pg-interface seed

# Run server (dev)
yarn workspace @oko-wallet/ewallet-api-server dev
# (prod)
# yarn workspace @oko-wallet/ewallet-api-server start
```

Verify:

- Health: `curl http://localhost:4200/` → Ok
- API docs: `http://localhost:4200/api_docs`

## oko_attached (embedded app)

```
cd oko
# Create env under ~/.oko/ewallet_attached.env
yarn workspace @oko-wallet/ewallet-attached create_env
# Example values:
# SERVER_PORT=3201
# VITE_EWALLET_API_ENDPOINT=http://localhost:4200
# VITE_CREDENTIAL_VAULT_API_ENDPOINT=http://localhost:4201
# VITE_CREDENTIAL_VAULT_API_ENDPOINT_2=http://localhost:4202
# VITE_DEMO_WEB_ORIGIN=http://localhost:3200  # host app origin embedding the iframe

yarn workspace @oko-wallet/ewallet-attached dev
```

Open the printed dev URL. This is an independent app that runs inside an iframe (not a traditional UI "widget"). The host app should iframe `http://localhost:3201/` and pass a `host_origin` parameter for initialization.

## Apps (oko/apps)

### demo_web (for testing)

```
cd oko
yarn workspace @oko-wallet/demo-web create_env
# Example values:
# SERVER_PORT=3200
# NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT=http://localhost:3201  # oko_attached URL

yarn workspace @oko-wallet/demo-web dev
```

Open: `http://localhost:3200`

### customer_dashboard

```
cd oko
# Create ~/.oko/customer_dashboard.env
yarn workspace @oko-wallet/customer-dashboard create_env
# Example values:
# SERVER_PORT=3203
# NEXT_PUBLIC_EWALLET_API_ENDPOINT=http://localhost:4200

yarn workspace @oko-wallet/customer-dashboard dev
```

Open: `http://localhost:3203`

### oko_admin_web

```
cd oko
yarn workspace @oko-wallet/ewallet-admin-web create_env
# Example values:
# SERVER_PORT=3204
# NEXT_PUBLIC_EWALLET_API_ENDPOINT=http://localhost:4200

yarn workspace @oko-wallet/ewallet-admin-web dev
```

Open: `http://localhost:3204`

## Recommended Boot Order

1. Prepare PostgreSQL (keyshare node/oko_api)
2. Start keyshare node (≥ 2 nodes recommended; 3 nodes optional)
3. Migrate/seed oko_api → start oko_api (4200)
4. Start oko_attached (3201)
5. Start Apps (demo_web 3200, customer_dashboard 3203, oko_admin_web 3204)

## Troubleshooting

- Port conflicts: change ports in env files and restart
- SMTP: for local, use sandbox/dummy values (missing required fields can block server startup)
- CORS: oko_api allows all origins by default; restrict origins in production
- keyshare node permissions: with Docker, ensure `DUMP_DIR`/`LOG_DIR` are writable by UID 1000

## Production Tips

- Terminate TLS with a reverse proxy (Nginx/Caddy) and lock down allowed origins
- Multi-node keyshare node (e.g., 2-of-3), retain/monitor dump directory
- Strong secrets (ADMIN_PASSWORD, ENCRYPTION_SECRET, JWT_SECRET, etc.) and a secret manager (KMS/Secret Manager)
- Managed/dedicated Postgres with automated backups and recovery plan

## Local CI helpers (yarn ci)

Use `yarn ci` at each workspace root to speed up repetitive local tasks. Arguments are forwarded to the internal CLI.

### oko root (SDK/keyshare node)

- Build packages: `cd oko && yarn ci build_pkgs`
  - Builds in order: stdlib, dotenv, SDK (core/cosmos/eth), crypto/bytes, ksn-interface, tecdsa-interface
- Typecheck: `cd oko && yarn ci typecheck`
- keyshare node DB migration: `cd oko && yarn ci db_migrate --use-env-file`
  - With `--use-env-file`, reads `~/.oko/key_share_node*.env` to create/migrate per-node DBs
  - Without it, uses local defaults (`localhost:5432`, `key_share_node_dev*`)

### oko-internal root (backend/apps/oko_attached)

- DB migration: `cd oko-internal && yarn ci db_migrate --use-env`
  - With `--use-env`, uses `~/.oko/ewallet_api_server.env`
  - Without it, auto-starts internal Docker Compose (`pg_local`) and migrates with test config
- DB seed: `cd oko-internal && yarn ci db_seed --use-env --target dev`
  - `--target` supports `dev | prod` (use `dev` for local)
- Build/copy Cait Sith (prepare embedded WASM): `cd oko-internal && yarn ci build_cs`
  - Builds addon/wasm and copies wasm into `ewallet_attached`
- Typecheck: `cd oko-internal && yarn ci typecheck`

Note: `yarn ci` is a thin wrapper around `yarn --cwd ./internals/ci run start <command>`. Run `yarn ci --help` to list available commands.
