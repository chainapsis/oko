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
  SIGN_ED25519 = "SIGN_ED25519",
  PRESIGN_ED25519 = "PRESIGN_ED25519",
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

export enum SignEd25519StageStatus {
  ROUND_1 = "ROUND_1_COMPLETED",
  ROUND_2 = "ROUND_2_COMPLETED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PresignEd25519StageStatus {
  COMPLETED = "COMPLETED",
  USED = "USED",
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

export interface SignEd25519StageData {
  nonces: number[] | null;
  identifier: number[] | null;
  commitments: number[] | null;
  signature_share: number[] | null;
  signature: number[] | null;
}

export interface PresignEd25519StageData {
  nonces: number[];
  identifier: number[];
  commitments: number[];
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

export type SignEd25519Stage = TssStageBase & {
  stage_type: TssStageType.SIGN_ED25519;
  stage_status: SignEd25519StageStatus;
  stage_data: SignEd25519StageData;
};

export type PresignEd25519Stage = TssStageBase & {
  stage_type: TssStageType.PRESIGN_ED25519;
  stage_status: PresignEd25519StageStatus;
  stage_data: PresignEd25519StageData;
};

export type TssStageStatus =
  | TriplesStageStatus
  | PresignStageStatus
  | SignStageStatus
  | SignEd25519StageStatus
  | PresignEd25519StageStatus;

export type TssStage =
  | TriplesStage
  | PresignStage
  | SignStage
  | SignEd25519Stage
  | PresignEd25519Stage;

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
