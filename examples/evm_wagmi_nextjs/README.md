## Oko Ethereum SDK + Next.js + wagmi + RainbowKit Example

A minimal example combining Oko Ethereum SDK, wagmi, and RainbowKit
with Next.js — mirroring a common Ethereum dApp structure. It connects to the
Ethereum Sepolia testnet by default and demonstrates social sign-in, account
info, and a simple transfer transaction.

### Requirements

- Node.js 22+
- Yarn (workspaces)

### Environment Variables

Create a `.env.local` file in this directory and set the following keys:

```bash
cp .env.example .env.local
```

```bash
# .env.local
NEXT_PUBLIC_OKO_API_KEY=YOUR_ISSUED_API_KEY
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
```

- Oko API key: get it from the
  [Oko Dashboard](https://dapp.oko.app)
- WalletConnect projectId: create one in the
  [WalletConnect Cloud](https://cloud.walletconnect.com)

### How to Run

```bash
yarn install
yarn dev
```

Open `http://localhost:3000` in your browser.
