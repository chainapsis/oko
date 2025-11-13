import type { KeplrEWalletInterface } from "@oko-wallet/oko-sdk-core";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_PORT: string;

      VITE_OKO_API_ENDPOINT: string;
      VITE_DEMO_WEB_ORIGIN: string;
      VITE_KEPLR_API_ENDPOINT: string;
      VITE_TX_INTERPRETER_API_ENDPOINT: string;
    }
  }

  interface Window {
    __keplr_ewallet: KeplrEWalletInterface | null | undefined;
  }

  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_APP_TITLE: string;

    SERVER_PORT: string;
    VITE_OKO_API_ENDPOINT: string;
    VITE_DEMO_WEB_ORIGIN: string;
    VITE_KEPLR_API_ENDPOINT: string;
    VITE_TX_INTERPRETER_API_ENDPOINT: string;
    VITE_AMPLITUDE_API_KEY: string;
    VITE_IPFS_GATEWAY_URL: string;
  }
}

export {};
