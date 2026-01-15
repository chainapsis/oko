#!/bin/bash
set -e

SESSION_NAME="oko-e2e"
WINDOW_NAME="services"
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

# Create session with named window
tmux new-session -d -s "$SESSION_NAME" -n "$WINDOW_NAME" -c "$PROJECT_ROOT"

# Create 5 more panes, applying tiled layout after each split to redistribute space
for _ in {1..5}; do
    tmux split-window -t "${SESSION_NAME}:${WINDOW_NAME}" -c "$PROJECT_ROOT"
    tmux select-layout -t "${SESSION_NAME}:${WINDOW_NAME}" tiled
done

# Get pane base index from tmux (could be 0 or 1)
PANE_BASE=$(tmux show-options -gv pane-base-index 2>/dev/null || echo "0")

# Send commands to each pane (adjust for base index)
P0=$((PANE_BASE + 0))
P1=$((PANE_BASE + 1))
P2=$((PANE_BASE + 2))
P3=$((PANE_BASE + 3))
P4=$((PANE_BASE + 4))
P5=$((PANE_BASE + 5))

# Pane 0: oko_api
tmux send-keys -t "${SESSION_NAME}:${WINDOW_NAME}.${P0}" "cd backend/oko_api/server && yarn dev" C-m

# Pane 1: oko_attached
tmux send-keys -t "${SESSION_NAME}:${WINDOW_NAME}.${P1}" "cd embed/oko_attached && yarn dev" C-m

# Pane 2: demo_web
tmux send-keys -t "${SESSION_NAME}:${WINDOW_NAME}.${P2}" "cd apps/demo_web && yarn dev" C-m

# Pane 3: ksn_1
tmux send-keys -t "${SESSION_NAME}:${WINDOW_NAME}.${P3}" "cd key_share_node/server && yarn start" C-m

# Pane 4: ksn_2
tmux send-keys -t "${SESSION_NAME}:${WINDOW_NAME}.${P4}" "cd key_share_node/server && yarn start_2" C-m

# Pane 5: ksn_3
tmux send-keys -t "${SESSION_NAME}:${WINDOW_NAME}.${P5}" "cd key_share_node/server && yarn start_3" C-m

print_info "All services started in tmux session: $SESSION_NAME"
print_info "Panes: oko_api, oko_attached, demo_web, ksn_1, ksn_2, ksn_3"
print_info "Layout: tiled (2x3 grid)"
echo ""
print_info "Attaching to session..."

# Attach to session
tmux attach-session -t "$SESSION_NAME"
