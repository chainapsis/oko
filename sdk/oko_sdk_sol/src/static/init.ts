import { OkoWallet } from "@oko-wallet/oko-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OkoSolWalletInterface,
  OkoSolWalletInitArgs,
} from "@oko-wallet-sdk-sol/types";
import type { OkoSolWalletInitError } from "@oko-wallet-sdk-sol/errors";
import { OkoSolWallet } from "@oko-wallet-sdk-sol/constructor";

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

  return {
    success: true,
    data: new (OkoSolWallet as unknown as new (...args: unknown[]) => OkoSolWalletInterface)(okoSolWalletRes.data),
  };
}
