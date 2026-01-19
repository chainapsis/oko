import type { OkoWalletInterface } from "./types";

declare global {
  interface Window {
    __oko: OkoWalletInterface | null | undefined;
    __oko_locked: boolean;
    __oko_ev: ((ev: MessageEvent) => void) | null | undefined;
  }
}

export {};
