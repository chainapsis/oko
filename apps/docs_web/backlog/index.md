## 📊 Keplr dApp Dashboard

A web interface to manage your integration. Here, you can:

- Manage API keys
- (Coming soon) View user accounts
- (Coming soon) Track usage metrics

_Keplr Embedded is currently in beta and only available to teams approved
through our partnerships process. If you'd like to integrate it into your dApp,
please fill out and submit [this form](https://typeform-link)._

## Integration Examples

### Ethereum dApp Integration

```typescript
import { initEWalletEIP1193Provider } from "@oko-wallet/oko-sdk-eth";
import { createPublicClient, createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";

// Initialize Keplr Embedded provider
const provider = await initEWalletEIP1193Provider({
  chains: [mainnet],
});

// Use with Viem (or any Web3 library)
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(provider),
});

// Sign transactions normally
const hash = await walletClient.sendTransaction({
  to: "0x...",
  value: parseEther("0.1"),
});
```

### Cosmos dApp Integration

```typescript
import { initCosmosEWallet } from "@oko-wallet/oko-sdk-cosmos";

// Initialize Cosmos wallet
const cosmosWallet = await initCosmosEWallet({ eWallet });

// Get user accounts
const accounts = await cosmosWallet.getAccounts();

// Sign transactions with CosmJS
const result = await cosmosWallet.signDirect({
  signerAddress: accounts[0].address,
  signDoc: transactionDoc,
});
```

## Technical Foundation

**Cryptographic Protocol**: Cait-Sith threshold ECDSA with committed Beaver
triples **Implementation**: Rust core with WebAssembly and Node.js bindings  
**Standards Compliance**: Full EIP-1193 and CosmJS compatibility **Security
Model**: Distributed key shares with cryptographic proofs

## Getting Started

Ready to integrate Keplr Embedded into your application?

### 🚀 **Quick Integration**

- **[Integration Guide](getting-started/01-getting-started.md)** - Add to your
  dApp in minutes
- **[SDK Documentation](sdk-usage/04-01-sdk-usage.md)** - Ethereum and Cosmos
  examples

### 🏗️ **Understanding the System**

- **[Complete Lifecycle Guide](lifecycle.md)** - End-to-end user journey from
  signup to transaction
- **[Technical Overview](concepts/03-threshold-ecdsa.md)** - How threshold
  signatures work
- **[Architecture](architecture/02-architecture.md)** - System design and
  integration points

### 📚 **API Reference**

- **[Authentication](api-reference/06-01-api-overview.md#authentication)** -
  Google OAuth and session management
- **[Provider Methods](api-reference/06-01-api-overview.md)** - Complete API
  reference

---

**Let's get started! Ready to eliminate single points of failure in your
application? Start with the
[Integration Guide](getting-started/01-getting-started.md).**
