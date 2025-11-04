import type {
  MakeSigModalErrorAckPayload,
  OtherModalErrorAckPayload,
} from "@oko-wallet/oko-sdk-core";

export type AppError = MakeSigModalErrorAckPayload | OtherModalErrorAckPayload;
