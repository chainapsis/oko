import { OkoFrostMainWallet } from "./main-wallet";
import { okoWalletInfo } from "./registry";
import type { OkoFrostWalletOptions } from "./types";

/**
 * Create an OkoFrostMainWallet instance with the given options.
 * Use this factory function to integrate Oko Wallet with Frost/Rialo applications.
 *
 * @example
 * ```typescript
 * const okoWallet = makeOkoFrostWallet({
 *   api_key: process.env.NEXT_PUBLIC_OKO_API_KEY!,
 *   sdk_endpoint: process.env.NEXT_PUBLIC_OKO_SDK_ENDPOINT,
 * });
 *
 * await okoWallet.initClient();
 * ```
 */
export const makeOkoFrostWallet = (
  options: OkoFrostWalletOptions,
): OkoFrostMainWallet => {
  return new OkoFrostMainWallet({
    ...okoWalletInfo,
    options,
  });
};

export { OkoFrostMainWallet } from "./main-wallet";
export { OkoFrostWalletClient } from "./client";
export { okoWalletInfo } from "./registry";
export type { OkoFrostWalletOptions, OkoFrostWalletInfo } from "./types";
