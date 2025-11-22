import type {
  MakeSigModalApproveAckPayload,
  MakeSigModalErrorAckPayload,
  MakeSigModalPayload,
  MakeSigModalRejectAckPayload,
} from "./make_sig";
import type {
  OtherModalApproveAckPayload,
  OtherModalErrorAckPayload,
  OtherModalPayload,
  OtherModalRejectAckPayload,
} from "./other";
import type {
  EmailLoginModalApproveAckPayload,
  EmailLoginModalErrorAckPayload,
  EmailLoginModalPayload,
  EmailLoginModalRejectAckPayload,
} from "./auth";

export * from "./common";
export * from "./other";
export * from "./make_sig";
export * from "./auth";

export type OpenModalPayload =
  | MakeSigModalPayload
  | OtherModalPayload
  | EmailLoginModalPayload;

export type OpenModalAckPayload =
  | MakeSigModalApproveAckPayload
  | MakeSigModalRejectAckPayload
  | MakeSigModalErrorAckPayload
  | OtherModalApproveAckPayload
  | OtherModalRejectAckPayload
  | OtherModalErrorAckPayload
  | EmailLoginModalApproveAckPayload
  | EmailLoginModalRejectAckPayload
  | EmailLoginModalErrorAckPayload;
