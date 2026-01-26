import { OkoWallet } from "@oko-wallet/oko-sdk-core";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OkoSvmWalletInterface,
  OkoSvmWalletInitArgs,
} from "@oko-wallet-sdk-svm/types";
import type { OkoSvmWalletInitError } from "@oko-wallet-sdk-svm/errors";
import { OkoSvmWallet } from "@oko-wallet-sdk-svm/constructor";
import { registerWalletStandard } from "@oko-wallet-sdk-svm/wallet-standard";

export function init(
  args: OkoSvmWalletInitArgs,
): Result<OkoSvmWalletInterface, OkoSvmWalletInitError> {
  const okoSvmWalletRes = OkoWallet.init(args);

  if (!okoSvmWalletRes.success) {
    console.error(
      "[oko-svm] oko-svm wallet core init fail, err: %s",
      okoSvmWalletRes.err,
    );

    return {
      success: false,
      err: {
        type: "oko_svm_wallet_init_fail",
        msg: okoSvmWalletRes.err.toString(),
      },
    };
  }

  const chainOptions = {
    chain_id: args.chain_id,
  };

  const svmWallet = new (
    OkoSvmWallet as unknown as new (
      ...args: unknown[]
    ) => OkoSvmWalletInterface
  )(okoSvmWalletRes.data, chainOptions);

  // Register wallet-standard if config provided
  if (args.wallet_standard && args.wallet_standard.length > 0) {
    registerWalletStandard(svmWallet, args.wallet_standard);
  }

  return {
    success: true,
    data: svmWallet,
  };
}
