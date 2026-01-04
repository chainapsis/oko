import type { Result } from "@oko-wallet/stdlib-js";
import { PublicKey } from "@solana/web3.js";

import type {
  OkoSolWalletInternal,
  OkoSolWalletState,
} from "@oko-wallet-sdk-sol/types";
import type { LazyInitError } from "@oko-wallet-sdk-sol/errors";

export async function lazyInit(
  wallet: OkoSolWalletInternal,
): Promise<Result<OkoSolWalletState, LazyInitError>> {
  const coreStateRes = await wallet.okoWallet.waitUntilInitialized;

  if (!coreStateRes.success) {
    return {
      success: false,
      err: {
        type: "lazy_init_error",
        msg: "Core wallet initialization failed",
      },
    };
  }

  // Set initial state from core wallet if user is already logged in
  // Use Ed25519 key for Solana (not secp256k1)
  const ed25519Key = await wallet.okoWallet.getPublicKeyEd25519();
  if (ed25519Key) {
    const publicKeyBytes = Buffer.from(ed25519Key, "hex");
    const newPublicKey = new PublicKey(publicKeyBytes);

    wallet.state.publicKey = newPublicKey;
    wallet.state.publicKeyRaw = ed25519Key;
    wallet.publicKey = newPublicKey;
    wallet.connected = true;
  }

  return {
    success: true,
    data: wallet.state,
  };
}
