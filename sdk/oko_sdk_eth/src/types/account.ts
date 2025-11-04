import type { Address, CustomSource, Hex } from "viem";

/**
 * Viem compatible account type
 * Referenced from viem's `LocalAccount` type for shape compatibility
 *
 * See viem `LocalAccount` definition:
 * - [LocalAccount type](https://github.com/wevm/viem/blob/cbfa2e0969224e97886339cbe060903e51680e90/src/accounts/types.ts#L74)
 */
export type OkoViemAccount = CustomSource & {
  address: Address;
  publicKey: Hex;
  source: "oko_wallet";
  type: "local";
};
