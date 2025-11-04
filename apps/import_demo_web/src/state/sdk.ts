import {
  CosmosEWallet,
  type CosmosEWalletInterface,
} from "@oko-wallet/oko-sdk-cosmos";
import { EthEWallet, type EthEWalletInterface } from "@oko-wallet/oko-sdk-eth";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { useUserInfoState } from "@oko-wallet-import-demo-web/state/user_info";

interface SDKState {
  keplr_sdk_eth: EthEWalletInterface | null;
  keplr_sdk_cosmos: CosmosEWalletInterface | null;

  isEthInitializing: boolean;
  isEthLazyInitialized: boolean;

  isCosmosInitializing: boolean;
  isCosmosLazyInitialized: boolean;
}

interface SDKActions {
  initKeplrSdkEth: () => Promise<EthEWalletInterface | null>;
  initKeplrSdkCosmos: () => Promise<CosmosEWalletInterface | null>;
}

const initialState: SDKState = {
  keplr_sdk_eth: null,
  keplr_sdk_cosmos: null,

  isEthInitializing: false,
  isEthLazyInitialized: false,

  isCosmosInitializing: false,
  isCosmosLazyInitialized: false,
};

export const useSDKState = create(
  combine<SDKState, SDKActions>(initialState, (set, get) => ({
    initKeplrSdkEth: async () => {
      const state = get();

      if (state.keplr_sdk_eth || state.isEthInitializing) {
        console.log("ETH SDK already initialized or initializing, skipping...");
        return state.keplr_sdk_eth;
      }

      console.log("Initializing ETH SDK...");
      set({
        isEthInitializing: true,
      });

      const initRes = EthEWallet.init({
        api_key:
          "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
        sdk_endpoint: process.env.NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT,
      });

      if (initRes.success) {
        console.log("Eth sdk initialized");

        const ethEWallet = initRes.data;
        set({
          keplr_sdk_eth: initRes.data,
          isEthInitializing: false,
        });

        await ethEWallet.waitUntilInitialized;
        set({
          isEthLazyInitialized: true,
        });

        return initRes.data;
      } else {
        console.error("sdk init fail, err: %s", initRes.err);
        set({ isEthInitializing: false });

        return null;
      }
    },
    initKeplrSdkCosmos: async () => {
      const state = get();

      if (state.keplr_sdk_cosmos) {
        console.log(
          "Cosmos SDK already initialized or initializing, skipping...",
        );
        return state.keplr_sdk_cosmos;
      }

      console.log("Initializing Cosmos SDK...");
      set({
        isCosmosInitializing: true,
      });

      const initRes = CosmosEWallet.init({
        api_key:
          "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
        sdk_endpoint: process.env.NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT,
      });

      if (initRes.success) {
        console.log("Cosmos SDK initialized");
        const cosmosSDK = initRes.data;
        setupCosmosListener(cosmosSDK);

        set({
          keplr_sdk_cosmos: cosmosSDK,
          isCosmosInitializing: false,
        });

        await cosmosSDK.waitUntilInitialized;
        set({
          isCosmosLazyInitialized: true,
        });

        return initRes.data;
      } else {
        console.error("Cosmos sdk init fail, err: %s", initRes.err);

        set({ isCosmosInitializing: false });

        return null;
      }
    },
  })),
);

function setupCosmosListener(cosmosSDK: CosmosEWalletInterface) {
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
