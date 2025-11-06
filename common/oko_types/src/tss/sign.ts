import type {
  RcvdSignMessages,
  SignOutput,
} from "@oko-wallet/tecdsa-interface";

export interface SignStep1Request {
  email: string;
  wallet_id: string;
  session_id: string;
  msg: number[];
  msgs_1: RcvdSignMessages;
}

export interface SignStep1Response {
  msgs_0: RcvdSignMessages;
}

export type SignStep1Body = {
  session_id: string;
  msg: number[];
  msgs_1: RcvdSignMessages;
};

export interface SignStep2Request {
  email: string;
  wallet_id: string;
  session_id: string;
  sign_output: SignOutput;
}

export interface SignStep2Response {
  sign_output: SignOutput;
}

export type SignStep2Body = {
  session_id: string;
  sign_output: SignOutput;
};
