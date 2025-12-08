#!/bin/bash


set -e

# Default values
MIGRATE_MODE=${MIGRATE_MODE:-"all"}
NODE_COUNT=${NODE_COUNT:-"2"}
DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"password"}
DB_NAME=${DB_NAME:-"key_share_node"}
DB_PORT=${DB_PORT:-"5432"}

echo "🔧 Key Share Node Migration Tool"
echo "=================================="
echo "Mode: $MIGRATE_MODE"
echo "Node Count: $NODE_COUNT"
if [ -n "$NODE_ID" ]; then
    echo "Node ID: $NODE_ID"
fi
echo "Database Host: $DB_HOST"
echo "Database User: $DB_USER"
echo "Database Port: $DB_PORT"
echo "=================================="

# Run migration
cd "$(dirname "$0")/.."

if [ "$MIGRATE_MODE" = "all" ]; then
    echo "🚀 Running migration for all nodes..."
    MIGRATE_MODE=all NODE_COUNT=$NODE_COUNT \
    DB_HOST=$DB_HOST DB_USER=$DB_USER DB_PASSWORD=$DB_PASSWORD \
    DB_NAME=$DB_NAME DB_PORT=$DB_PORT \
    cargo run --bin migrate
elif [ "$MIGRATE_MODE" = "one" ]; then
    if [ -z "$NODE_ID" ]; then
        echo "Error: NODE_ID must be set when MIGRATE_MODE=one"
        exit 1
    fi
    echo "🚀 Running migration for node $NODE_ID..."
    MIGRATE_MODE=one NODE_ID=$NODE_ID \
    DB_HOST=$DB_HOST DB_USER=$DB_USER DB_PASSWORD=$DB_PASSWORD \
    DB_NAME=$DB_NAME DB_PORT=$DB_PORT \
    cargo run --bin migrate
else
    echo "Error: Invalid MIGRATE_MODE: $MIGRATE_MODE. Use 'all' or 'one'"
    exit 1
fi

echo "Migration completed successfully!"
