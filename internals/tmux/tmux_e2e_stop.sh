#!/bin/bash

SESSION_NAME="oko-e2e"

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux kill-session -t "$SESSION_NAME"
    echo -e "${GREEN}[INFO]${NC} Session '$SESSION_NAME' terminated."
else
    echo -e "${YELLOW}[WARN]${NC} Session '$SESSION_NAME' not found."
fi
