import type { Wallet } from "@interchain-kit/core";
import { OKO_ICON } from "./constant";

export const okoWalletInfo: Wallet = {
  name: "oko-wallet",
  prettyName: "Oko Wallet",
  logo: OKO_ICON,
  keystoreChange: "accountsChanged",
} as Wallet;
