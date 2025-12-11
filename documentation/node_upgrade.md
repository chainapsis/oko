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

### 3. Check and Update Environment Variables

New environment variables may be added in some upgrades. Check the upgrade
announcement from the Keplr team to determine if new environment variables are
required.

> **Note**: If no new environment variables are required, you can skip this
> step.

If new environment variables are required:

1. Edit the `.env` file:

   ```bash
   # Open .env file with a text editor
   nano .env
   # or
   vi .env
   ```

2. Add the required environment variables to your `.env` file, referencing
   `env.example` for guidance.

   Example:

   ```bash
   # Add to .env file
   NEW_ENV_VAR=your_value_here
   ```

3. Set the environment variable values:
   - Follow the values or guidance provided in the upgrade announcement from the
     Keplr team
   - Securely manage sensitive information (tokens, passwords, etc.)
   - Refer to comments in `env.example` to understand the purpose of each
     environment variable

4. Verify that your environment variable configuration is correct:

   ```bash
   # Validate Docker Compose configuration (checks for syntax errors in environment variables)
   docker compose config
   ```

   This command validates the configuration file without starting containers. If
   errors occur, review the syntax of your environment variable file.

### 4. Upgrade the Key Share Node

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

### 5. Verify the Upgrade

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
