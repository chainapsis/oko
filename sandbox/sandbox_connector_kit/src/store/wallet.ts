import { create } from "zustand";
import type { Wallet } from "@wallet-standard/base";
import type { OkoWalletRegistration } from "@oko-wallet/oko-connector-kit";

interface WalletState {
  wallet: Wallet | null;
  registration: OkoWalletRegistration | null;
  isInitialized: boolean;
  isConnected: boolean;
  publicKey: string | null;
  setWallet: (wallet: Wallet | null) => void;
  setRegistration: (registration: OkoWalletRegistration | null) => void;
  setInitialized: (initialized: boolean) => void;
  setConnected: (connected: boolean, publicKey: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  registration: null,
  isInitialized: false,
  isConnected: false,
  publicKey: null,
  setWallet: (wallet) => set({ wallet }),
  setRegistration: (registration) => set({ registration }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setConnected: (connected, publicKey) =>
    set({ isConnected: connected, publicKey }),
}));
