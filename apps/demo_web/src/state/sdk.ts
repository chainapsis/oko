import { create } from "zustand";
import { combine } from "zustand/middleware";
import { useUserInfoState } from "@oko-wallet-demo-web/state/user_info";

// Dummy interfaces to replace real SDK ones
type OkoEthWalletInterface = any;
type OkoCosmosWalletInterface = any;

interface SDKState {
  oko_eth: OkoEthWalletInterface | null;
  oko_cosmos: OkoCosmosWalletInterface | null;

  isEthInitializing: boolean;
  isEthLazyInitialized: boolean;

  isCosmosInitializing: boolean;
  isCosmosLazyInitialized: boolean;
}

interface SDKActions {
  initOkoEth: () => Promise<OkoEthWalletInterface | null>;
  initOkoCosmos: () => Promise<OkoCosmosWalletInterface | null>;
}

const initialState: SDKState = {
  oko_eth: null,
  oko_cosmos: null,

  isEthInitializing: false,
  isEthLazyInitialized: false,

  isCosmosInitializing: false,
  isCosmosLazyInitialized: false,
};

export const useSDKState = create(
  combine<SDKState, SDKActions>(initialState, (set, get) => ({
    initOkoEth: async () => {
      console.log("Maintenance Mode: ETH SDK init disabled");
      return null;
    },
    initOkoCosmos: async () => {
      console.log("Maintenance Mode: Cosmos SDK init disabled");
      return null;
    },
  })),
);
