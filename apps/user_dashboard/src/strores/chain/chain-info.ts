import {
  AppCurrency,
  BIP44,
  BitcoinChainInfo,
  ChainInfo,
  FeeCurrency,
  StarknetChainInfo,
} from "@keplr-wallet/types";

export interface EVMNativeChainInfo {
  readonly rpc: string;
  readonly chainId: number;
  readonly websocket?: string;
  readonly currencies: AppCurrency[];
  readonly feeCurrencies: FeeCurrency[];
  readonly bip44: BIP44;
  readonly features?: string[];
}

export type ChainInfoModule = "cosmos" | "starknet" | "bitcoin" | "evm";

export interface ModularChainInfoBase {
  readonly chainId: string;
  readonly chainName: string;
  readonly chainSymbolImageUrl?: string;
  readonly isTestnet?: boolean;
  readonly isNative?: boolean;
}

export type ModularChainInfo = ModularChainInfoBase &
  (
    | {
        readonly cosmos: Omit<ChainInfo, "evm">;
      }
    | {
        readonly starknet: StarknetChainInfo;
      }
    | {
        readonly bitcoin: BitcoinChainInfo;
        readonly linkedChainKey: string;
      }
    | {
        readonly evm: EVMNativeChainInfo;
      }
    | {
        readonly cosmos: Omit<ChainInfo, "evm">;
        readonly evm: EVMNativeChainInfo;
      }
  );
