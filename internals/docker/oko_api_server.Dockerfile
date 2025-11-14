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
RUN mkdir -p /home/node/oko && chown -R node:node /home/node/oko
WORKDIR /home/node/oko
COPY --chown=node:node ../../.. .
 
RUN yarn set version 4.7.0

# Install dependencies for addon
RUN yarn workspaces focus addon

# Build Rust napi addon
WORKDIR /home/node/oko/crypto/tecdsa/cait_sith_keplr_addon/addon
RUN yarn run build

# Build stdlib-js
WORKDIR /home/node/oko
RUN yarn workspaces focus @oko-wallet/stdlib-js
WORKDIR /home/node/oko/lib/stdlib_js
RUN yarn run build

# Build dotenv (depends on stdlib-js)
WORKDIR /home/node/oko
RUN yarn workspaces focus @oko-wallet/dotenv
WORKDIR /home/node/oko/lib/dotenv
RUN yarn run build

# Build crypto/bytes
WORKDIR /home/node/oko
RUN yarn workspaces focus @oko-wallet/bytes
WORKDIR /home/node/oko/crypto/bytes
RUN yarn run build

WORKDIR /home/node/oko

# Install dependencies for oko_api_server
RUN yarn workspaces focus --production \
      @oko-wallet/oko-api-server

# ───────────────
# Runtime stage
# ───────────────
FROM node:22.0.0-alpine AS runtime

USER node
WORKDIR /home/node/oko

# Copy source code from builder
COPY --from=builder --chown=node:node /home/node/oko /home/node/oko

WORKDIR /home/node/oko/backend/oko_api/server
CMD ["yarn", "start"]
