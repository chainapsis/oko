import { KeplrEWallet } from "@oko-wallet/oko-sdk-core";

declare global {
  interface Window {
    __oko: KeplrEWallet | null | undefined;
  }
}

export {}; // Ensures this file is treated as a module
