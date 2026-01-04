import type { PublicKey } from "@solana/web3.js";

export type SolWalletEventMap = {
  connect: PublicKey;
  disconnect: void;
  accountChanged: PublicKey | null;
  error: Error;
};

export type SolWalletEvent = keyof SolWalletEventMap;

export type SolWalletEventHandler<K extends SolWalletEvent> = (
  payload: SolWalletEventMap[K],
) => void;
