import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function signMessage(
  this: OkoSolWalletInterface,
  _message: Uint8Array,
): Promise<Uint8Array> {
  throw new Error("Not implemented");
}
