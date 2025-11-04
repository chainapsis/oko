import type { NodeNameAndEndpoint } from "@oko-wallet/ewallet-types/user_key_share";

export type RequestSplitSharesError =
  | {
      code: "WALLET_NOT_FOUND";
      affectedNode: NodeNameAndEndpoint;
    }
  | {
      code: "INSUFFICIENT_SHARES";
      got: number;
      need: number;
    };
