import type { Coin } from "@keplr-wallet/proto-types/cosmos/base/v1beta1/coin";

export interface UnpackedMsgForView {
  typeUrl: string;
  value: string;
  unpacked?: unknown;
}

export interface SendMsg {
  amount: Coin[];
  from_address: string;
  to_address: string;
}
