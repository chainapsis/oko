import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function disconnect(this: OkoSolWalletInterface): Promise<void> {
  this.state.publicKey = null;
  this.state.publicKeyRaw = null;
  this.publicKey = null;
  this.connected = false;
}
