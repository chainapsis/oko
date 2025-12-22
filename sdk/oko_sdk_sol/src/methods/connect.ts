import { PublicKey } from "@solana/web3.js";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export async function connect(this: OkoSolWalletInterface): Promise<void> {
  if (this.connected) {
    return;
  }

  this.connecting = true;

  try {
    await this.waitUntilInitialized;

    const publicKeyHex = await this.okoWallet.getPublicKey();

    if (!publicKeyHex) {
      throw new Error("Not signed in");
    }

    const publicKeyBytes = Buffer.from(publicKeyHex, "hex");

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
