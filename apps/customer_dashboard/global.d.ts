import { KeplrEWallet } from "@oko-wallet/oko-sdk-core";

declare global {
  interface Window {
    // __keplr_ewallet: KeplrEWallet | null | undefined;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_PORT: string;
      NEXT_PUBLIC_EWALLET_API_ENDPOINT: string;
      NEXT_PUBLIC_KEPLR_EWALLET_DOCS_ENDPOINT: string;
      NEXT_PUBLIC_KEPLR_EWALLET_DEMO_ENDPOINT: string;
    }
  }
}

// Ensures this file is treated as a module (necessary if esm)
export { };
