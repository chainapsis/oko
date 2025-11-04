---
title: SDK Overview
sidebar_position: 1
---

# SDK Overview

Oko provides specialized SDKs for different blockchain ecosystems.
Choose the right packages for your project.

<!-- prettier-ignore -->
:::tip Get started faster
Prefer a ready-to-run example? Try the
**[Starter Templates](../getting-started/starter-templates.md)**.
:::

## Installation

```bash
# For Cosmos ecosystem
npm install @oko-wallet/oko-sdk-cosmos

# For Ethereum/EVM chains
npm install @oko-wallet/oko-sdk-eth

# Core SDK (for custom integration)
npm install @oko-wallet/oko-sdk-core
```

## Quick Setup

### Cosmos

```typescript
import { CosmosEWallet } from "@oko-wallet/oko-sdk-cosmos";

const initRes = CosmosEWallet.init(config);
if (!initRes.success) {
  throw new Error(`Cosmos wallet initialization failed: ${initRes.err}`);
}

const cosmosWallet = initRes.data;
```

### Ethereum

```typescript
import { EthEWallet } from "@oko-wallet/oko-sdk-eth";

const initRes = EthEWallet.init(config);
if (!initRes.success) {
  throw new Error(`Eth wallet initialization failed: ${initRes.err}`);
}

const ethWallet = initRes.data;
const provider = await ethWallet.getEthereumProvider();
```

## Next Steps

- **[Cosmos Integration](./cosmos-integration)** - Complete Cosmos setup
- **[Ethereum Integration](./ethereum-integration)** - Complete Ethereum setup
- **[React Integration](./react-integration)** - React patterns
- **[RainbowKit Integration](./rainbow-kit-integration)** - RainbowKit
  integration
- **[Error Handling](./error-handling)** - Best practices
