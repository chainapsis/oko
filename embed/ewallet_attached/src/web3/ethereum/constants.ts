import { mainnet } from "viem/chains";

export const DEFAULT_ETH_FEE_TYPE = "eip1559";
export const OP_STACK_L1_DATA_FEE_FEATURE = "op-stack-l1-data-fee";

export const mainnetChain = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: ["https://evm-1.keplr.app"],
    },
  },
};

// TODO: extend keplr's ChainInfo type to add block explorers
export const evmExplorers: Record<string, string> = {
  "eip155:1": "https://etherscan.io",
  "eip155:42161": "https://arbiscan.io",
  "eip155:10": "https://optimistic.etherscan.io",
  "eip155:80094": "https://berascan.com",
  "eip155:1514": "https://www.storyscan.io",
  "eip155:81457": "https://blastexplorer.io",
  "eip155:130": "https://unichain.blockscout.com",
  "eip155:8453": "https://basescan.org",
  "eip155:43114": "https://subnets.avax.network/c-chain",
  "eip155:137": "https://polygonscan.com",
  "eip155:56": "https://bscscan.com",
  "eip155:57073": "https://explorer.inkonchain.com",
  "eip155:59144": "https://lineascan.build",
};

export const opStackContracts = {
  gasPriceOracle: { address: "0x420000000000000000000000000000000000000F" },
  l1Block: { address: "0x4200000000000000000000000000000000000015" },
  l2CrossDomainMessenger: {
    address: "0x4200000000000000000000000000000000000007",
  },
  l2Erc721Bridge: { address: "0x4200000000000000000000000000000000000014" },
  l2StandardBridge: { address: "0x4200000000000000000000000000000000000010" },
  l2ToL1MessagePasser: {
    address: "0x4200000000000000000000000000000000000016",
  },
} as const;
