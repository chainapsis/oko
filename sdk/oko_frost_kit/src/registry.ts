import type { OkoFrostWalletInfo } from "./types";
import { OKO_ICON } from "./constant";

export const okoWalletInfo: Omit<OkoFrostWalletInfo, "options"> = {
  name: "oko-wallet",
  prettyName: "Oko Wallet",
  logo: OKO_ICON,
  mode: "extension",
  mobileDisabled: false,
};
