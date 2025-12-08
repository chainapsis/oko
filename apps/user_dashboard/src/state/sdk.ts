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

import { useUserInfoState } from "@oko-wallet-user-dashboard/state/user_info";

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
      const state = get();

      if (state.oko_eth || state.isEthInitializing) {
        console.log("ETH SDK already initialized or initializing, skipping...");
        return state.oko_eth;
      }

      console.log("Initializing ETH SDK...");
      set({
        isEthInitializing: true,
      });

      const initRes = OkoEthWallet.init({
        api_key:
          "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
        sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
      });

      if (initRes.success) {
        console.log("Eth sdk initialized");

        const okoEth = initRes.data;
        set({
          oko_eth: initRes.data,
          isEthInitializing: false,
        });

        await okoEth.waitUntilInitialized;
        set({
          isEthLazyInitialized: true,
        });

        return okoEth;
      } else {
        console.error("sdk init fail, err: %s", initRes.err);
        set({ isEthInitializing: false });

        return null;
      }
    },
    initOkoCosmos: async () => {
      const state = get();

      if (state.oko_cosmos) {
        console.log(
          "Cosmos SDK already initialized or initializing, skipping...",
        );
        return state.oko_cosmos;
      }

      console.log("Initializing Cosmos SDK...");
      set({
        isCosmosInitializing: true,
      });

      const initRes = OkoCosmosWallet.init({
        api_key:
          "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
        sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
      });

      if (initRes.success) {
        console.log("Cosmos SDK initialized");

        const okoCosmos = initRes.data;
        setupCosmosListener(okoCosmos);

        set({
          oko_cosmos: okoCosmos,
          isCosmosInitializing: false,
        });

        await okoCosmos.waitUntilInitialized;
        set({
          isCosmosLazyInitialized: true,
        });

        return okoCosmos;
      } else {
        console.error("Cosmos sdk init fail, err: %s", initRes.err);

        set({ isCosmosInitializing: false });

        return null;
      }
    },
  })),
);

function setupCosmosListener(cosmosSDK: OkoCosmosWalletInterface) {
  const setUserInfo = useUserInfoState.getState().setUserInfo;

  if (cosmosSDK) {
    cosmosSDK.on({
      type: "accountsChanged",
      handler: ({ email, publicKey }) => {
        setUserInfo({
          email: email || null,
          publicKey: publicKey ? Buffer.from(publicKey).toString("hex") : null,
        });
      },
    });
  }
}
