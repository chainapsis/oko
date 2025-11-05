---
title: Quick Start
sidebar_position: 2
---

# Quick Start

Unify your wallet experience across Ethereum and Cosmos with Oko.

## Requirements

- **Node.js 22+** and **npm/yarn**
- A modern web framework (React, Vue, etc.)

## NPM Installation

Choose the packages you need for your target ecosystems:

```bash
# For Cosmos ecosystem
npm install @oko-wallet/oko-sdk-cosmos

# For Ethereum/EVM chains
npm install @oko-wallet/oko-sdk-eth

# Core SDK (if building custom integration)
npm install @oko-wallet/oko-sdk-core
```

## API Key Setup

Before using the SDK, you'll need your API key from the
[Oko dApp Dashboard](https://dapp.oko.app):

```typescript
// Set your API key (from the dApp Dashboard)
const OKO_API_KEY = "your-api-key-here";

// Configure the SDK with your API key
const config = {
  apiKey: OKO_API_KEY,
  // other configuration options...
};
```

> **📋 Note:** Get your API key from the dApp Dashboard after completing the
> partnership process described in the
> [Integration Overview](./integration-overview.md).

## Cosmos Integration

Works seamlessly with CosmJS and other Cosmos libraries:

```typescript
import { OkoCosmosWallet } from "@oko-wallet/oko-sdk-cosmos";

// Initialize Cosmos wallet
const initRes = OkoCosmosWallet.init(config);

if (!initRes.success) {
  throw new Error(`Cosmos wallet initialization failed: ${initRes.err}`);
}

const cosmosWallet = initRes.data;

// Get user accounts
const accounts = await cosmosWallet.getAccounts();

// Sign transactions with Oko
const result = await cosmosWallet.signDirect(
  "cosmoshub-4",
  accounts[0].address,
  transactionDoc,
);
```

## Ethereum Integration

Drop-in replacement for `window.ethereum` - your existing dApp code stays the
same:

```typescript
import { OkoEthWallet } from "@oko-wallet/oko-sdk-eth";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";

// Initialize Oko (replaces window.ethereum)
const initRes = OkoEthWallet.init(config);
if (!initRes.success) {
  throw new Error(`Eth wallet initialization failed: ${initRes.err}`);
}

const ethWallet = initRes.data;
const provider = await ethWallet.getEthereumProvider();

// Use with your existing Web3 library like Viem
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(provider),
});

// Sign transactions normally - users get the same experience
const hash = await walletClient.sendTransaction({
  to: "0x...",
  value: parseEther("0.1"),
});
```

## Multi-Chain Support

**The power of Oko:** Use familiar APIs for both Ethereum and Cosmos,
while giving users **one account** that works across **both ecosystems**. Same
Google login, consistent experience.

```typescript
import { OkoCosmosWallet } from "@oko-wallet/oko-sdk-cosmos";
import { OkoEthWallet } from "@oko-wallet/oko-sdk-eth";

// Support both Ethereum and Cosmos in one integration
const cosmosInitRes = OkoCosmosWallet.init(config);
const ethInitRes = OkoEthWallet.init(config);

if (!cosmosInitRes.success) {
  throw new Error(`Cosmos wallet initialization failed: ${cosmosInitRes.err}`);
}

if (!ethInitRes.success) {
  throw new Error(`Eth wallet initialization failed: ${ethInitRes.err}`);
}

const cosmosWallet = cosmosInitRes.data;
const ethWallet = ethInitRes.data;

// Users can interact with both ecosystems seamlessly
// Same Google account, same user experience!
```

## Authentication Flow

Understanding how Oko works will help you integrate it effectively:

**User Experience:**

1. User clicks "Connect Wallet" in your dApp
2. User signs in with Google (handled automatically by the SDK)
3. Cryptographic key shares are generated using threshold signatures
4. User can now sign transactions - no browser extensions needed!

## Next Steps

**🚀 Ready to integrate?**

- **[Complete SDK Examples](../sdk-usage/sdk-overview.md)** - Detailed Ethereum
  and Cosmos code samples with multi-chain setups
- **[Architecture Overview](../architecture)** - Understand how threshold
  signatures work
- **[API Reference](../api-reference/api-overview.md)** - Complete method
  documentation

**🎯 Want to understand the technology?**

- **[Threshold ECDSA Explained](../concepts/threshold-ecdsa.md)** - Learn about
  the cryptography behind Oko
