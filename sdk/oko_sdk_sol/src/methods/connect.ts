import { PublicKey } from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function connect(this: OkoSolWalletInterface): Promise<void> {
  if (this.connected) {
    return;
  }

  this.connecting = true;

  try {
    await this.waitUntilInitialized;

    // Check if already signed in
    let publicKeyHex = await this.okoWallet.getPublicKey();

    // If not signed in, trigger sign-in flow with ed25519 curve for Solana
    if (!publicKeyHex) {
      // Default to Google sign-in with ed25519 curve type
      await this.okoWallet.signIn("google", { curveType: "ed25519" });
      publicKeyHex = await this.okoWallet.getPublicKey();
    }

    if (!publicKeyHex) {
      throw new Error("Failed to get public key after sign-in");
    }

    // For Solana, we need the ed25519 public key (32 bytes)
    const publicKeyBytes = Buffer.from(publicKeyHex, "hex");

    // Solana public keys are 32 bytes
    if (publicKeyBytes.length !== 32) {
      throw new Error(
        `Invalid public key length: expected 32 bytes, got ${publicKeyBytes.length}`,
      );
    }

    const publicKey = new PublicKey(publicKeyBytes);

    this.state.publicKey = publicKey;
    this.state.publicKeyRaw = publicKeyHex;
    this.publicKey = publicKey;
    this.connected = true;
  } finally {
    this.connecting = false;
  }
}
