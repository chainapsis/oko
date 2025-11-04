import type { OkoCosmosWalletInterface } from "@oko-wallet-sdk-cosmos/types";

export async function getPublicKey(
  this: OkoCosmosWalletInterface,
): Promise<Uint8Array | null> {
  console.log("[oko-cosmos] getPublicKey: start");

  try {
    await this.waitUntilInitialized;

    if (this.state === null) {
      throw new Error("Cosmos SDK is not properly initialized");
    }

    if (this.state.publicKey) {
      console.log("[oko-cosmos] getPublicKey: cached public key");

      return this.state.publicKey;
    }

    console.log("[oko-cosmos] getPublicKey: getPublicKey from eWallet");

    const pk = await this.okoWallet.getPublicKey();

    if (pk === null) {
      this.state.publicKey = null;
      return null;
    } else {
      const publicKey = Buffer.from(pk, "hex");

      this.state.publicKey = publicKey;
      return this.state.publicKey;
    }
  } catch (error: any) {
    console.error("[oko-cosmos] getPublicKey failed with error:", error);

    throw error;
  }
}
