import {
  OkoCosmosWallet,
  type OkoCosmosWalletInterface,
} from "@oko-wallet/oko-sdk-cosmos";
import {
  OkoEthWallet,
  type OkoEthWalletInterface,
} from "@oko-wallet/oko-sdk-eth";
import { create } from "zustand";
import { combine } from "zustand/middleware";

interface SDKState {
  oko_eth: OkoEthWalletInterface | null;
  oko_cosmos: OkoCosmosWalletInterface | null;
  isEthInitializing: boolean;
  isCosmosInitializing: boolean;
}

interface SDKActions {
  initOkoEth: () => OkoEthWalletInterface | null;
  initOkoCosmos: () => OkoCosmosWalletInterface | null;
}

export const useSDKState = create(
  combine<SDKState, SDKActions>(
    {
      oko_eth: null,
      oko_cosmos: null,
      isEthInitializing: false,
      isCosmosInitializing: false,
    },
    (set, get) => ({
      initOkoEth: () => {
        const state = get();

        if (state.oko_eth || state.isEthInitializing) {
          console.log(
            "ETH SDK already initialized or initializing, skipping...",
          );
          return state.oko_eth;
        }

        console.log("Initializing ETH SDK...");
        set({ isEthInitializing: true });

        // TODO: @hyunjae
        const initRes = OkoEthWallet.init({
          api_key:
            "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
          sdk_endpoint: import.meta.env.VITE_OKO_SDK_ENDPOINT,
        });

        if (initRes.success) {
          console.log("Eth sdk initialized");

          set({
            oko_eth: initRes.data,
            isEthInitializing: false,
          });

          return initRes.data;
        } else {
          console.error("sdk init fail, err: %s", initRes.err);
          set({ isEthInitializing: false });

          return null;
        }
      },
      initOkoCosmos: () => {
        const state = get();

        if (state.oko_cosmos || state.isCosmosInitializing) {
          console.log(
            "Cosmos SDK already initialized or initializing, skipping...",
          );
          return state.oko_cosmos;
        }

        console.log("Initializing Cosmos SDK...");
        set({ isCosmosInitializing: true });

        // TODO: @hyunjae
        const initRes = OkoCosmosWallet.init({
          api_key:
            "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
          sdk_endpoint: import.meta.env.VITE_OKO_SDK_ENDPOINT,
        });

        if (initRes.success) {
          console.log("Cosmos SDK initialized");

          const cosmosSDK = initRes.data;

          set({
            oko_cosmos: cosmosSDK,
            isCosmosInitializing: false,
          });

          cosmosSDK.on({
            type: "accountsChanged",
            handler: (payload) => {
              console.log("ev - accountsChanged", payload);
            },
          });

          return initRes.data;
        } else {
          console.error("Cosmos sdk init fail, err: %s", initRes.err);

          set({ isCosmosInitializing: false });

          return null;
        }
      },
    }),
  ),
);
