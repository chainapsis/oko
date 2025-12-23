import type { PublicKey } from "@solana/web3.js";

export type OkoSolWalletEvent = "connect" | "disconnect" | "error";

export type OkoSolWalletConnectEvent = {
  type: "connect";
  handler: (publicKey: PublicKey) => void;
};

export type OkoSolWalletDisconnectEvent = {
  type: "disconnect";
  handler: () => void;
};

export type OkoSolWalletErrorEvent = {
  type: "error";
  handler: (error: Error) => void;
};

export type OkoSolWalletEventHandler =
  | OkoSolWalletConnectEvent
  | OkoSolWalletDisconnectEvent
  | OkoSolWalletErrorEvent;
