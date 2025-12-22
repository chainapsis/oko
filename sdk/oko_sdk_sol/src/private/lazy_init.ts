import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OkoSolWalletInterface,
  OkoSolWalletState,
} from "@oko-wallet-sdk-sol/types";
import type { LazyInitError } from "@oko-wallet-sdk-sol/errors";

export async function lazyInit(
  wallet: OkoSolWalletInterface,
): Promise<Result<OkoSolWalletState, LazyInitError>> {
  try {
    await wallet.okoWallet.waitUntilInitialized;

    // TODO

    return {
      success: true,
      data: wallet.state,
    };
  } catch (e) {
    return {
      success: false,
      err: {
        type: "lazy_init_error",
        msg: e instanceof Error ? e.message : String(e),
      },
    };
  }
}
