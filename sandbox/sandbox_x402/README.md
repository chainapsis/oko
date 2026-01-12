# x402 Sandbox

A sandbox for testing the x402 protocol (HTTP 402 Payment Required) with Oko wallet.

## Overview

x402 is an open payment protocol developed by Coinbase that enables instant stablecoin payments directly over HTTP using the 402 status code.

This sandbox includes:

- **Client**: Next.js app with Oko wallet integration for x402 payments
- **Server**: Express-based API server with x402 payment middleware

## Prerequisites

1. Node.js >= 22
2. Base Sepolia testnet USDC
   - Get test USDC from [Circle Faucet](https://faucet.circle.com/)
3. Oko wallet account

## Installation

```bash
# From root
yarn install
```

## Configuration

```bash
cp .env.example .env
```

Edit `.env` to set your wallet address for receiving payments:

```env
NEXT_PUBLIC_OKO_API_KEY=your_oko_api_key
NEXT_PUBLIC_OKO_SDK_ENDPOINT=http://localhost:3201
NEXT_PUBLIC_X402_SERVER_URL=http://localhost:4402
PAYMENT_ADDRESS=0xYourWalletAddress
```

## Running

### Run both client and server

```bash
yarn dev:all
```

### Run client only

```bash
yarn dev
```

Client starts at `http://localhost:3206`

### Run server only

```bash
yarn dev:server
```

Server starts at `http://localhost:4402`

## API Endpoints

| Method | Path | Price | Description |
|--------|------|-------|-------------|
| GET | `/` | FREE | Server info |
| GET | `/protected` | $0.001 USDC | Protected content |

## How It Works

```
1. Client -> Server: GET /protected
2. Server -> Client: HTTP 402 + Payment-Required header
3. Client: Sign USDC payment with Oko wallet
4. Client -> Server: GET /protected + X-Payment header
5. Server: Verify payment via Facilitator
6. Server -> Client: HTTP 200 + Content
```

## Network Info

- **Network**: Base Sepolia (eip155:84532)
- **USDC Contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Facilitator**: `https://x402.org/facilitator`

## Project Structure

```
sandbox_x402/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── LoginView.tsx
│   │   ├── ConnectedView.tsx
│   │   ├── AccountInfo.tsx
│   │   └── x402_widget.tsx
│   ├── hooks/
│   │   └── use_oko_eth.ts
│   ├── store/
│   │   └── sdk.ts
│   └── server/
│       └── index.ts
├── public/
├── next.config.ts
├── postcss.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Resources

- [x402 Official Site](https://www.x402.org/)
- [x402 GitHub](https://github.com/coinbase/x402)
- [x402 Documentation](https://x402.gitbook.io/x402/)
- [Coinbase x402 Docs](https://docs.cdp.coinbase.com/x402/welcome)
