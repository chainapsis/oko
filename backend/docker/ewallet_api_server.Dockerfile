# ───────────────
# Builder stage
# ───────────────
FROM node:22.0.0-alpine AS builder

# Install build tools and system dependencies for Rust and Node native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    musl-dev \
    openssl-dev \
    curl

# Switch to node user and set Rust environment variables
USER node
ENV CARGO_HOME=/home/node/.cargo
ENV PATH="${CARGO_HOME}/bin:${PATH}"

# Install rustup (Rust toolchain manager)
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Create working directory and copy source code
RUN mkdir -p /home/node/ewallet && chown -R node:node /home/node/ewallet
WORKDIR /home/node/ewallet
COPY --chown=node:node ../../.. .
 
RUN yarn set version 4.7.0

# Install dependencies for addon
RUN yarn workspaces focus addon

# Build Rust napi addon
WORKDIR /home/node/ewallet/lib/tecdsa/cait_sith_keplr_addon/addon
RUN yarn run build

WORKDIR /home/node/ewallet

# Install dependencies for ewallet_api_server
RUN yarn workspaces focus --production \
      @oko-wallet/ewallet-api-server

# ───────────────
# Runtime stage
# ───────────────
FROM node:22.0.0-alpine AS runtime

USER node
WORKDIR /home/node/ewallet

# Copy source code from builder
COPY --from=builder --chown=node:node /home/node/ewallet /home/node/ewallet

WORKDIR /home/node/ewallet/backend/ewallet_api/server
CMD ["yarn", "start"]
