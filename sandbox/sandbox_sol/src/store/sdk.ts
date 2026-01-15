import { create } from "zustand";

import type { OkoWalletInterface } from "@oko-wallet/oko-sdk-core";
import type { OkoSolWalletInterface } from "@oko-wallet/oko-sdk-sol";

interface SdkState {
  okoWallet: OkoWalletInterface | null;
  okoSolWallet: OkoSolWalletInterface | null;
  isInitialized: boolean;
  isConnected: boolean;
  publicKey: string | null;
  setOkoWallet: (wallet: OkoWalletInterface) => void;
  setOkoSolWallet: (wallet: OkoSolWalletInterface) => void;
  setInitialized: (initialized: boolean) => void;
  setConnected: (connected: boolean, publicKey: string | null) => void;
}

export const useSdkStore = create<SdkState>((set) => ({
  okoWallet: null,
  okoSolWallet: null,
  isInitialized: false,
  isConnected: false,
  publicKey: null,
  setOkoWallet: (wallet) => set({ okoWallet: wallet }),
  setOkoSolWallet: (wallet) => set({ okoSolWallet: wallet }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setConnected: (connected, publicKey) =>
    set({ isConnected: connected, publicKey }),
}));
