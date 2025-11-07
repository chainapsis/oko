# Node Upgrade

This guide explains how to upgrade your Key Share Node to the latest version.

## Upgrade Process

### 1. Pull Latest Changes & Checkout the version

```bash
# Navigate to your repository directory
# Note: If you cloned the repository before the rename, your directory might be named 'ewallet' instead of 'oko'
cd /path/to/oko  # or /path/to/ewallet if you cloned before the repository rename

git pull origin main
git fetch origin tag <version>
git checkout <version>
```

### 2. Navigate to Docker Directory

```bash
# Use 'ewallet' instead of 'oko' if your directory is named 'ewallet'
cd oko/key_share_node/docker
```

### 3. Upgrade the Key Share Node

For most upgrades, use the standard upgrade process:

```bash
docker compose up -d --build key_share_node
```

This will rebuild the Key Share Node container with the latest code while
preserving all existing data and database schema.

#### Database Reset (Only when requested by Keplr team)

**⚠️ WARNING: This will reset your database schema and may cause data loss.**

If explicitly requested by the Keplr team to reset the database:

```bash
RESET_DB=true docker compose up -d --build key_share_node
```

### 4. Verify the Upgrade

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs key_share_node

# Verify server health and version
curl http://localhost:${SERVER_PORT}/status
```

Verify that both the `version` and `git_hash` fields in the response match the
values announced in the upgrade request from the Keplr team.

## Troubleshooting

If the upgrade fails:

1. Check the logs: `docker compose logs key_share_node`
2. Verify database connectivity
3. Ensure all environment variables are properly set
4. Contact the Keplr team for assistance
