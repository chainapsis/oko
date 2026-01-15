#!/bin/bash
set -e

SESSION_NAME="oko-e2e"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RESET_DB=false

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        --reset)
            RESET_DB=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --reset    Reset database before starting services"
            echo "  -h, --help Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check tmux installation
if ! command -v tmux &> /dev/null; then
    print_error "tmux is not installed. Please install tmux first."
    exit 1
fi

# Check and kill existing session
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    print_warn "Existing session '$SESSION_NAME' found. Killing it..."
    tmux kill-session -t "$SESSION_NAME"
fi

# Reset database
if [ "$RESET_DB" = true ]; then
    print_info "Resetting database..."
    cd "$PROJECT_ROOT"

    print_info "Running: yarn ci db_migrate_api --use-env-file"
    yarn ci db_migrate_api --use-env-file

    print_info "Running: yarn ci db_seed_api --use-env-file"
    yarn ci db_seed_api --use-env-file

    print_info "Running: yarn ci db_migrate_ksn --use-env-file"
    yarn ci db_migrate_ksn --use-env-file

    print_info "Database reset complete!"
fi

print_info "Creating tmux session: $SESSION_NAME"

# 1. oko_api (create session with first window)
tmux new-session -d -s "$SESSION_NAME" -n "oko_api" -c "$PROJECT_ROOT/backend/oko_api/server"
tmux send-keys -t "$SESSION_NAME:oko_api" "yarn dev" C-m

# 2. oko_attached
tmux new-window -t "$SESSION_NAME" -n "oko_attached" -c "$PROJECT_ROOT/embed/oko_attached"
tmux send-keys -t "$SESSION_NAME:oko_attached" "yarn dev" C-m

# 3. demo_web
tmux new-window -t "$SESSION_NAME" -n "demo_web" -c "$PROJECT_ROOT/apps/demo_web"
tmux send-keys -t "$SESSION_NAME:demo_web" "yarn dev" C-m

# 4. ksn_1
tmux new-window -t "$SESSION_NAME" -n "ksn_1" -c "$PROJECT_ROOT/key_share_node/server"
tmux send-keys -t "$SESSION_NAME:ksn_1" "yarn start" C-m

# 5. ksn_2
tmux new-window -t "$SESSION_NAME" -n "ksn_2" -c "$PROJECT_ROOT/key_share_node/server"
tmux send-keys -t "$SESSION_NAME:ksn_2" "yarn start_2" C-m

# 6. ksn_3
tmux new-window -t "$SESSION_NAME" -n "ksn_3" -c "$PROJECT_ROOT/key_share_node/server"
tmux send-keys -t "$SESSION_NAME:ksn_3" "yarn start_3" C-m

# Select first window
tmux select-window -t "$SESSION_NAME:oko_api"

print_info "All services started in tmux session: $SESSION_NAME"
print_info "Windows: oko_api, oko_attached, demo_web, ksn_1, ksn_2, ksn_3"
echo ""
print_info "Attaching to session..."

# Attach to session
tmux attach-session -t "$SESSION_NAME"
