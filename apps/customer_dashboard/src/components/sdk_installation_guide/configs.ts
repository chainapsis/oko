import { EthereumIcon } from "@oko-wallet/oko-common-ui/icons/ethereum_icon";
import { CosmosIcon } from "@oko-wallet/oko-common-ui/icons/cosmos_icon";

export const FRAMEWORKS = [{ name: "React" }] as const;

export const EVM_CLIENT_LIBS = [
  {
    name: "Viem",
    library: "viem",
    addon: {
      name: "Wagmi",
      label: "Use Wagmi",
      type: "toggle" as const,
      key: "useWagmi",
    },
  },
] as const;

export const AVAILABLE_NETWORKS = [
  {
    name: "Cosmos",
    Icon: CosmosIcon,
    library: "@oko-wallet/oko-sdk-cosmos",
  },
  {
    name: "Ethereum",
    Icon: EthereumIcon,
    library: "@oko-wallet/oko-sdk-eth",
  },
] as const;

export type Framework = (typeof FRAMEWORKS)[number];
export type EVMClientLib = (typeof EVM_CLIENT_LIBS)[number];
export type Network = (typeof AVAILABLE_NETWORKS)[number];

export type SDKConfig = {
  framework: Framework;
  networks: Network[];
  evmClientLib: EVMClientLib;
  isWagmiWrapped: boolean;
};
