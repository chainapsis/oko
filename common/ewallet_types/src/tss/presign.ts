import type { RcvdPresignMessages } from "@oko-wallet/tecdsa-interface";

export interface PresignStep1Request {
  email: string;
  wallet_id: string;
  session_id: string;
  msgs_1: RcvdPresignMessages;
}

export type PresignStep1Body = {
  session_id: string;
  msgs_1: RcvdPresignMessages;
};

export interface PresignStep1Response {
  msgs_0: RcvdPresignMessages;
}

export interface PresignStep2Request {
  email: string;
  wallet_id: string;
  session_id: string;
  wait_1_0_1: [string, string];
}

export type PresignStep2Body = {
  session_id: string;
  wait_1_0_1: [string, string];
};

export interface PresignStep2Response {
  wait_1_1_0: [string, string];
}

export interface PresignStep3Request {
  email: string;
  wallet_id: string;
  session_id: string;
  presign_big_r: string;
}

export type PresignStep3Body = {
  session_id: string;
  presign_big_r: string;
};

export interface PresignStep3Response {
  presign_big_r: string;
}
