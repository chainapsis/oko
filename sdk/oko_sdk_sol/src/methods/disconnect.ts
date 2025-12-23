import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function disconnect(this: OkoSolWalletInterface): Promise<void> {
  // Clear session in iframe (clears stored auth token and public key)
  await this.okoWallet.signOut();

  // Clear local state
  this.state.publicKey = null;
  this.state.publicKeyRaw = null;
  this.publicKey = null;
  this.connected = false;
}
