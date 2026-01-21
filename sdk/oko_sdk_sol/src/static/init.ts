import { OkoWallet } from "@oko-wallet/oko-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OkoSolWalletInterface,
  OkoSolWalletInitArgs,
} from "@oko-wallet-sdk-sol/types";
import type { OkoSolWalletInitError } from "@oko-wallet-sdk-sol/errors";
import { OkoSolWallet } from "@oko-wallet-sdk-sol/constructor";
import { registerWalletStandard } from "@oko-wallet-sdk-sol/wallet-standard";

export function init(
  args: OkoSolWalletInitArgs,
): Result<OkoSolWalletInterface, OkoSolWalletInitError> {
  const okoSolWalletRes = OkoWallet.init(args);

  if (!okoSolWalletRes.success) {
    console.error(
      "[oko-sol] oko-sol wallet core init fail, err: %s",
      okoSolWalletRes.err,
    );

    return {
      success: false,
      err: {
        type: "oko_sol_wallet_init_fail",
        msg: okoSolWalletRes.err.toString(),
      },
    };
  }

  const wallet = new (
    OkoSolWallet as unknown as new (
      ...args: unknown[]
    ) => OkoSolWalletInterface
  )(okoSolWalletRes.data);

  if (args.walletStandard) {
    const config = args.walletStandard;
    wallet.waitUntilInitialized.then((result) => {
      if (result.success) {
        registerWalletStandard(wallet, config);
      }
    });
  }

  return {
    success: true,
    data: wallet,
  };
}
