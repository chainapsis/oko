#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse options
SKIP_RUST=false
SKIP_TYPECHECK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-rust)
            SKIP_RUST=true
            shift
            ;;
        --skip-typecheck)
            SKIP_TYPECHECK=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Local CI setup script - prepares the development environment"
            echo ""
            echo "Options:"
            echo "  --skip-rust       Skip Rust cargo check"
            echo "  --skip-typecheck  Skip TypeScript typecheck"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo ""
echo "=========================================="
echo "  Oko Local CI Setup"
echo "=========================================="
echo ""

# Check Node.js version
print_step "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    print_error "Node.js 22+ required. Current: $(node -v)"
    exit 1
fi
print_info "Node.js $(node -v) OK"

# Enable corepack
print_step "Enabling corepack..."
corepack enable
print_info "Corepack enabled"

# Install dependencies
print_step "Installing dependencies..."
yarn install --immutable
print_info "Dependencies installed"

# Build CS packages (WASM)
print_step "Building CS packages (cait-sith WASM)..."
yarn ci build_cs
print_info "CS packages built"

# Build Frost packages (EdDSA WASM)
print_step "Building Frost packages (frost-ed25519 WASM)..."
yarn ci build_frost
print_info "Frost packages built"

# Build internal packages
print_step "Building internal packages..."
yarn ci build_pkgs
print_info "Internal packages built"

# Build SDK packages
print_step "Building SDK packages..."
yarn ci build_sdk
print_info "SDK packages built"

# TypeScript typecheck
if [ "$SKIP_TYPECHECK" = false ]; then
    print_step "Running TypeScript typecheck..."
    yarn ci typecheck
    print_info "Typecheck passed"
else
    print_warn "Skipping TypeScript typecheck"
fi

# Rust check
if [ "$SKIP_RUST" = false ]; then
    if command -v cargo &> /dev/null; then
        print_step "Running Rust cargo check..."
        cargo check --workspace
        print_info "Rust check passed"
    else
        print_warn "Rust not installed, skipping cargo check"
    fi
else
    print_warn "Skipping Rust cargo check"
fi

echo ""
echo "=========================================="
echo -e "  ${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
print_info "You can now run: ./internals/tmux/tmux-e2e-start.sh"
echo ""
