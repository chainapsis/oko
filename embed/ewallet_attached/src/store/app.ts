import type { Theme } from "@oko-wallet/ewallet-common-ui/theme";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

const STORAGE_KEY = "oko-wallet-app-2";

interface WalletState {
  walletId: string;
  publicKey: string;
  email: string;
}

interface PerOriginState {
  theme: Theme | null;
  apiKey: string | null;
  keyshare_1: string | null;
  nonce: string | null;
  authToken: string | null;
  wallet: WalletState | null;
}

interface AppState {
  perOrigin: { [origin: string]: PerOriginState };
}

interface AppActions {
  resetAll: (hostOrigin: string) => void;
  resetWallet: (hostOrigin: string) => void;

  getNonce: (hostOrigin: string) => string | null;
  setNonce: (hostOrigin: string, nonce: string | null) => void;

  getWallet: (hostOrigin: string) => WalletState | null;
  setWallet: (hostOrigin: string, wallet: WalletState | null) => void;

  getKeyshare_1: (hostOrigin: string) => string | null;
  setKeyshare_1: (hostOrigin: string, keyshare_1: string | null) => void;

  getApiKey: (hostOrigin: string) => string | null;
  setApiKey: (hostOrigin: string, apiKey: string | null) => void;

  getAuthToken: (hostOrigin: string) => string | null;
  setAuthToken: (hostOrigin: string, jwtToken: string | null) => void;

  getTheme: (hostOrigin: string) => Theme | null;
  setTheme: (hostOrigin: string, theme: Theme | null) => void;

  getHostOriginList: () => string[];
  // getPublicKey: (hostOrigin: string) => string | undefined;
}

export const useAppState = create(
  persist(
    combine<AppState, AppActions>({ perOrigin: {} }, (set, get) => ({
      setApiKey: (hostOrigin: string, apiKey: string | null) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              ...get().perOrigin[hostOrigin],
              apiKey,
            },
          },
        });
      },
      setNonce: (hostOrigin: string, nonce: string | null) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              ...get().perOrigin[hostOrigin],
              nonce,
            },
          },
        });
      },
      setKeyshare_1: (hostOrigin: string, keyshare_1: string | null) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              ...get().perOrigin[hostOrigin],
              keyshare_1,
            },
          },
        });
      },
      setAuthToken: (hostOrigin: string, authToken: string | null) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              ...get().perOrigin[hostOrigin],
              authToken,
            },
          },
        });
      },

      resetAll: (hostOrigin: string) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              theme: null,
              apiKey: null,
              keyshare_1: null,
              nonce: null,
              authToken: null,
              wallet: null,
            },
          },
        });
      },

      setWallet: (hostOrigin: string, wallet: WalletState | null) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              ...get().perOrigin[hostOrigin],
              wallet,
            },
          },
        });
      },
      resetWallet: (hostOrigin: string) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              ...get().perOrigin[hostOrigin],
              wallet: null,
            },
          },
        });
      },

      getWallet: (hostOrigin: string) => {
        return get().perOrigin[hostOrigin]?.wallet;
      },
      getNonce: (hostOrigin: string) => {
        return get().perOrigin[hostOrigin]?.nonce;
      },
      getKeyshare_1: (hostOrigin: string) => {
        return get().perOrigin[hostOrigin]?.keyshare_1;
      },
      getApiKey: (hostOrigin: string) => {
        return get().perOrigin[hostOrigin]?.apiKey;
      },
      getAuthToken: (hostOrigin: string) => {
        return get().perOrigin[hostOrigin]?.authToken;
      },
      getTheme: (hostOrigin: string) => {
        return get().perOrigin[hostOrigin]?.theme;
      },
      setTheme: (hostOrigin: string, theme: Theme | null) => {
        set({
          perOrigin: {
            ...get().perOrigin,
            [hostOrigin]: {
              ...get().perOrigin[hostOrigin],
              theme,
            },
          },
        });
      },
      getHostOriginList: () => {
        return Object.keys(get().perOrigin);
      },
    })),
    { name: STORAGE_KEY },
  ),
);
