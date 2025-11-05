---
title: Self-Hosting Guide
---

## Overview

This guide explains how to self-host Oko in a standalone setup. It covers how to run each service locally or on servers and the recommended boot order.

## Components (to run)

### keyshare node (`oko/key_share_node`)

Stores encrypted SSS shares of the user's first TSS share. Multiple nodes (2-3 recommended) each store one SSS share, ensuring no single node can reconstruct the user's share. Provides these shares to users during login for reconstruction.

### oko_api (`oko/backend/oko_api/server`)

The main API server that orchestrates the system. Stores the user's second TSS share encrypted in its database. Performs distributed TSS transaction signing with the client (which holds the first TSS share) without ever reconstructing the full private key. Manages customer organizations, wallets, user accounts, Google OAuth authentication, JWT token issuance, and provides REST APIs for dashboards and admin functions.

### oko_attached (`oko/embed/ewallet_attached`)

Client-side web application running in an iframe that provides the user interface for wallet operations. Handles key generation, manages the user's first TSS share locally, and coordinates with `oko_api` for transaction signing. Communicates with host applications via `postMessage` API to expose wallet functionality.

### Apps (`oko/apps`)

- **demo_web**: A test application demonstrating how to integrate Oko wallet functionality into a dApp using the SDK
- **customer_dashboard**: A web interface for customers to manage their API keys, view usage statistics, and configure their organization settings
- **oko_admin_web**: An administrative interface for system administrators to manage customers, monitor key share nodes, configure system settings, and oversee the entire Oko infrastructure

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
- Build tools for native Node addons (make, gcc/g++, and Python 3 for node-gyp)
  - Ubuntu/Debian:
    ```bash
    sudo apt update
    sudo apt install -y build-essential python3
    ```
  - Rocky Linux / RHEL / Fedora:
    ```bash
    sudo dnf groupinstall -y "Development Tools"
    sudo dnf install -y python3
    ```
  - Verify:
    ```bash
    make --version
    gcc --version
    python3 --version
    ```

## Clone the Repository

```bash
git clone https://github.com/chainapsis/oko.git
cd oko
```

## Install/Build

```bash
cd oko && yarn && yarn ci build_pkgs && yarn ci build_cs
```

This installs dependencies and builds core packages and Cait Sith. See [Local CI helpers (yarn ci)](#local-ci-helpers-yarn-ci) below for detailed descriptions of each command.

## keyshare node

Option A — Docker Compose (recommended)

```bash
cd oko/key_share_node/docker
cp env.example .env
```

1. **Create encryption secret file** (32-byte hex string, you can use any random value):

```bash
# Generate a random 32-byte (256-bit) encryption secret as hex and save it to a file
sudo mkdir -p /opt/key_share_node
openssl rand -hex 32 | tr -d '\n' | sudo tee /opt/key_share_node/encryption_secret.txt >/dev/null
sudo chmod 600 /opt/key_share_node/encryption_secret.txt
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

```bash
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

Option A — Docker Compose (recommended)

```
cd oko/backend/docker
cp env.example .env
```

1. **Edit `.env` file** with your configuration:

```bash
# Database Configuration
DB_USER=postgres                    # PostgreSQL database username
DB_PASSWORD=postgres                # PostgreSQL database password
DB_NAME=ewallet_dev                 # PostgreSQL database name
DB_PORT=5432                        # PostgreSQL database port
DB_SSL=false                        # Enable/disable SSL connection (true/false)
PG_DATA_DIR=./pg_data               # Host directory for PostgreSQL data persistence

# Server Configuration
SERVER_PORT=4200                    # Port number for the oko API server
JWT_SECRET=jwtsecret               # Secret key for JWT token signing
JWT_EXPIRES_IN=1H                   # JWT token expiration time

# SMTP Configuration (for email verification)
SMTP_HOST=smtp.gmail.com           # SMTP server hostname
SMTP_PORT=587                      # SMTP server port (587 for TLS, 465 for SSL)
SMTP_USER=no-reply@example.com     # SMTP authentication username
SMTP_PASS=your-app-password        # SMTP authentication password
FROM_EMAIL=no-reply@example.com     # Email address used as sender for verification emails
EMAIL_VERIFICATION_EXPIRATION_MINUTES=3  # Email verification code expiration time in minutes

# S3 Configuration (for customer data storage)
S3_REGION=ap-northeast-2           # AWS S3 region
S3_BUCKET=oko-wallet-customer      # AWS S3 bucket name
S3_ACCESS_KEY_ID=ID                # AWS S3 access key ID
S3_SECRET_ACCESS_KEY=SECRET_KEY     # AWS S3 secret access key

# Encryption Configuration
ENCRYPTION_SECRET=temp-enc-secret  # Secret key used to encrypt user shares (use a strong random value in production)

# Elasticsearch Configuration (optional, for logging)
ES_URL=                            # Elasticsearch URL (leave empty if not using)
ES_INDEX=index                     # Elasticsearch index name (optional)
ES_CLIENT_INDEX=client_index       # Elasticsearch client index name (optional)
ES_USERNAME=username               # Elasticsearch username (optional)
ES_PASSWORD=pw                     # Elasticsearch password (optional)
```

2. **Start the services**:

```bash
docker compose up -d
```

3. **Verify the services are running**:

```bash
docker compose ps
curl http://localhost:4200/
```

The database will be automatically migrated on first startup. See [Database Seeding](#database-seeding) below for seeding instructions.

Option B — Local (dev)

1. **Create environment file**:

```bash
cd oko
yarn workspace @oko-wallet/oko-api-server create_env
```

2. **Edit `~/.oko/oko_api_server.env` file** with your configuration:

```bash
# Server Configuration
SERVER_PORT=4200                    # Port number for the ewallet API server

# JWT Configuration
JWT_SECRET=jwtsecret               # Secret key for JWT token signing
JWT_EXPIRES_IN=1H                   # JWT token expiration time

# SMTP Configuration (for email verification)
SMTP_HOST=smtp.gmail.com           # SMTP server hostname
SMTP_PORT=587                      # SMTP server port (587 for TLS, 465 for SSL)
SMTP_USER=no-reply@example.com     # SMTP authentication username
SMTP_PASS=your-app-password        # SMTP authentication password
FROM_EMAIL=no-reply@example.com     # Email address used as sender for verification emails
EMAIL_VERIFICATION_EXPIRATION_MINUTES=3  # Email verification code expiration time in minutes

# S3 Configuration (for customer data storage)
S3_REGION=ap-northeast-2           # AWS S3 region
S3_BUCKET=oko-wallet-customer      # AWS S3 bucket name
S3_ACCESS_KEY_ID=ID                # AWS S3 access key ID
S3_SECRET_ACCESS_KEY=SECRET_KEY     # AWS S3 secret access key

# Database Configuration
DB_HOST=localhost                  # PostgreSQL database host
DB_PORT=5432                       # PostgreSQL database port
DB_USER=postgres                   # PostgreSQL database username
DB_PASSWORD=postgres               # PostgreSQL database password
DB_NAME=ewallet_dev                # PostgreSQL database name
DB_SSL=false                       # Enable/disable SSL connection (true/false)

# Encryption Configuration
ENCRYPTION_SECRET=temp-enc-secret  # Secret key used to encrypt user shares (use a strong random value in production)

# Elasticsearch Configuration (optional, for logging)
ES_URL=                            # Elasticsearch URL (leave empty if not using)
ES_INDEX=index                     # Elasticsearch index name (optional)
ES_CLIENT_INDEX=client_index       # Elasticsearch client index name (optional)
ES_USERNAME=username               # Elasticsearch username (optional)
ES_PASSWORD=pw                     # Elasticsearch password (optional)
```

3. **Migrate database**:

```bash
# Migrate database schema
USE_ENV=true yarn workspace @oko-wallet/oko-pg-interface migrate
```

See [Database Seeding](#database-seeding) below for seeding instructions.

4. **Run server**:

```bash
# Development mode
yarn workspace @oko-wallet/oko-api-server dev

# Production mode
# yarn workspace @oko-wallet/oko-api-server start
```

5. **Verify the server is running**:

```bash
# Health check
curl http://localhost:4200/

# API documentation
# Open in browser: http://localhost:4200/api_docs
```

### Database Seeding

After the database migration is complete, you can seed the database with initial development/test data.

Seeding populates the database with:

- **Admin user**: Admin account for oko_admin_web (`admin@keplr.app` / password: `0000`)
- **Customer**: Demo customer record (`demo_web`)
- **Customer dashboard user**: User for customer_dashboard (`demo@keplr.app` / password: `00000000`)
- **API keys**: API keys for customer authentication
- **Key share nodes**: Key share node server URLs (dev: `http://localhost:4201`, `http://localhost:4202`)
- **Key share node metadata**: SSS threshold configuration (default: 2)
- **TSS activation settings**: Master switch for TSS operations

To seed the database with initial data, run the following command from the project root:

**For Option A (Docker Compose):**

```bash
cd oko
# Replace DB_* values with those from your backend/docker/.env file
DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_PASSWORD=postgres DB_NAME=ewallet_dev DB_SSL=false TARGET=dev yarn workspace @oko-wallet/oko-pg-interface seed
```

**For Option B (Local):**

```bash
cd oko
# Uses environment variables from ~/.oko/oko_api_server.env
USE_ENV=true TARGET=dev yarn workspace @oko-wallet/oko-pg-interface seed
```

## oko_attached (embedded app)

```bash
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

```bash
cd oko
yarn workspace @oko-wallet/demo-web create_env
# Example values:
# SERVER_PORT=3200
# NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT=http://localhost:3201  # oko_attached URL

yarn workspace @oko-wallet/demo-web dev
```

Open: `http://localhost:3200`

### customer_dashboard

```bash
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

```bash
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

### oko root

- Build packages: `yarn ci build_pkgs`
  - Builds in order: stdlib, dotenv, SDK (core/cosmos/eth), crypto/bytes, ksn-interface, tecdsa-interface
  - Required for all services that depend on these core packages
- Build Cait Sith: `yarn ci build_cs`
  - Builds Rust addon (required for `oko_api` TSS operations: triples, presign, sign)
  - Builds WASM (required for `oko_attached` client-side TSS operations: keygen, combine, reshare, signing)
  - Copies WASM into `oko_attached/public/pkg/`
- Typecheck: `yarn ci typecheck`
- keyshare node DB migration: `yarn ci db_migrate_ksn --use-env-file`
  - With `--use-env-file`, reads `~/.oko/key_share_node*.env` to create/migrate per-node DBs
  - Without it, uses local defaults (`localhost:5432`, `key_share_node_dev*`)
- DB migration: `yarn ci db_migrate_api --use-env`
  - With `--use-env`, uses `~/.oko/oko_api_server.env`
  - Without it, auto-starts internal Docker Compose (`pg_local`) and migrates with test config
- DB seed: `yarn ci db_seed_api --use-env --target dev`
  - `--target` supports `dev | prod` (use `dev` for local)

Note: `yarn ci` is a thin wrapper around `yarn --cwd ./internals/ci run start <command>`. Run `yarn ci --help` to list available commands.
