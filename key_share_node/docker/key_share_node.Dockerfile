FROM node:22-alpine3.21

# Install PostgreSQL client tools for pg_dump and git
RUN apk add --no-cache postgresql17-client git

# Enable Corepack for Yarn version management
RUN corepack enable

# Create working directory and copy source code
USER node
RUN mkdir -p /home/node/key_share_node/node_modules && chown -R node:node /home/node/key_share_node
WORKDIR /home/node/key_share_node
COPY --chown=node:node . .

# Install dependencies for stdlib-js
WORKDIR /home/node/key_share_node
RUN yarn workspaces focus @oko-wallet/stdlib-js

# Build stdlib-js
WORKDIR /home/node/key_share_node/lib/stdlib_js
RUN yarn run build

# Install dependencies for crypto/bytes
WORKDIR /home/node/key_share_node
RUN yarn workspaces focus @oko-wallet/bytes

# Build crypto/bytes
WORKDIR /home/node/key_share_node/crypto/bytes
RUN yarn run build

# Install dependencies for crypto-js
WORKDIR /home/node/key_share_node
RUN yarn workspaces focus @oko-wallet/crypto-js

# Build crypto-js
WORKDIR /home/node/key_share_node/crypto/crypto_js
RUN yarn run build

# Install dependencies for oko-types
WORKDIR /home/node/key_share_node
RUN yarn workspaces focus @oko-wallet/oko-types

# Build oko-types
WORKDIR /home/node/key_share_node/common/oko_types
RUN yarn run build

# Install dependencies for ksn_interface
WORKDIR /home/node/key_share_node
RUN yarn workspaces focus @oko-wallet/ksn-interface

# Build ksn_interface
WORKDIR /home/node/key_share_node/key_share_node/ksn_interface
RUN yarn run build

# Install dependencies for key share node server
WORKDIR /home/node/key_share_node
RUN yarn workspaces focus --production \
    @oko-wallet/key-share-node-server

WORKDIR /home/node/key_share_node/key_share_node/server

CMD [ "yarn", "start" ]
