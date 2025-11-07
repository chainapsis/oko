import type {
  PresignOutput,
  PresignState,
  RcvdPresignMessages,
  RcvdSignMessages,
  RcvdTriplesMessages,
  SignOutput,
  SignState,
  TriplePub,
  TriplesShare,
  TriplesState,
} from "@oko-wallet/tecdsa-interface";

import type { TssSessionState } from "./tss_session";

export enum TssStageType {
  TRIPLES = "TRIPLES",
  PRESIGN = "PRESIGN",
  SIGN = "SIGN",
}

interface TssStageBase {
  stage_id: string;
  session_id: string;
  stage_type: TssStageType;
  stage_status: string;
  stage_data?: Record<string, any>;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export enum TriplesStageStatus {
  STEP_1 = "STEP_1_COMPLETED",
  STEP_2 = "STEP_2_COMPLETED",
  STEP_3 = "STEP_3_COMPLETED",
  STEP_4 = "STEP_4_COMPLETED",
  STEP_5 = "STEP_5_COMPLETED",
  STEP_6 = "STEP_6_COMPLETED",
  STEP_7 = "STEP_7_COMPLETED",
  STEP_8 = "STEP_8_COMPLETED",
  STEP_9 = "STEP_9_COMPLETED",
  STEP_10 = "STEP_10_COMPLETED",
  COMPLETED = "COMPLETED", // step 11 completed
  FAILED = "FAILED",
}

export enum PresignStageStatus {
  STEP_1 = "STEP_1_COMPLETED",
  STEP_2 = "STEP_2_COMPLETED",
  COMPLETED = "COMPLETED", // step 3 completed
  FAILED = "FAILED",
}

export enum SignStageStatus {
  STEP_1 = "STEP_1_COMPLETED",
  COMPLETED = "COMPLETED", // step 2 completed
  FAILED = "FAILED",
}

export interface TriplesStageData {
  triple_state: TriplesState | null;
  triple_messages: RcvdTriplesMessages | null;
  triple_pub_0: TriplePub | null;
  triple_pub_1: TriplePub | null;
  triple_share_0: TriplesShare | null;
  triple_share_1: TriplesShare | null;
}

export interface PresignStageData {
  presign_state: PresignState | null;
  presign_messages: RcvdPresignMessages | null;
  presign_output: PresignOutput | null;
}

export interface SignStageData {
  sign_state: SignState | null;
  sign_messages: RcvdSignMessages | null;
  sign_output: SignOutput | null;
}

export type TriplesStage = TssStageBase & {
  stage_type: TssStageType.TRIPLES;
  stage_status: TriplesStageStatus;
  stage_data: TriplesStageData;
};

export type PresignStage = TssStageBase & {
  stage_type: TssStageType.PRESIGN;
  stage_status: PresignStageStatus;
  stage_data: PresignStageData;
};

export type SignStage = TssStageBase & {
  stage_type: TssStageType.SIGN;
  stage_status: SignStageStatus;
  stage_data: SignStageData;
};

export type TssStageStatus =
  | TriplesStageStatus
  | PresignStageStatus
  | SignStageStatus;

export type TssStage = TriplesStage | PresignStage | SignStage;

export type CreateTssStageRequest = Pick<
  TssStage,
  "session_id" | "stage_type" | "stage_status" | "stage_data"
>;

export type UpdateTssStageRequest = Pick<
  TssStage,
  "stage_status" | "stage_data" | "error_message"
>;

export type TssStageWithSessionData = TssStage & {
  wallet_id: string;
  session_state: TssSessionState;
};
