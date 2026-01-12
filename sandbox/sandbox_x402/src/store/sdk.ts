import { create } from "zustand";
import type { OkoWalletInterface } from "@oko-wallet/oko-sdk-core";
import type { OkoEthWalletInterface } from "@oko-wallet/oko-sdk-eth";

interface SdkState {
  okoWallet: OkoWalletInterface | null;
  okoEthWallet: OkoEthWalletInterface | null;
  isInitialized: boolean;
  isConnected: boolean;
  address: string | null;
  setOkoWallet: (wallet: OkoWalletInterface) => void;
  setOkoEthWallet: (wallet: OkoEthWalletInterface) => void;
  setInitialized: (initialized: boolean) => void;
  setConnected: (connected: boolean, address: string | null) => void;
}

export const useSdkStore = create<SdkState>((set) => ({
  okoWallet: null,
  okoEthWallet: null,
  isInitialized: false,
  isConnected: false,
  address: null,
  setOkoWallet: (wallet) => set({ okoWallet: wallet }),
  setOkoEthWallet: (wallet) => set({ okoEthWallet: wallet }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setConnected: (connected, address) => set({ isConnected: connected, address }),
}));
