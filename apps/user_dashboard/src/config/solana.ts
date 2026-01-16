import type { ModularChainInfo } from "@oko-wallet-user-dashboard/types/chain";

export const SOLANA_MAINNET: ModularChainInfo = {
  chainId: "solana:mainnet",
  chainName: "Solana",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  isTestnet: false,
  solana: {
    rpc: "https://api.mainnet-beta.solana.com",
    currencies: [
      {
        coinDenom: "SOL",
        coinMinimalDenom: "lamports",
        coinDecimals: 9,
        coinGeckoId: "solana",
      },
    ],
  },
};

export const SOLANA_DEVNET: ModularChainInfo = {
  chainId: "solana:devnet",
  chainName: "Solana Devnet",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  isTestnet: true,
  solana: {
    rpc: "https://api.devnet.solana.com",
    currencies: [
      {
        coinDenom: "SOL",
        coinMinimalDenom: "lamports",
        coinDecimals: 9,
      },
    ],
  },
};
