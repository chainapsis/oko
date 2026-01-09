import type {
  CommitmentEntry,
  SignatureShareEntry,
} from "@oko-wallet/teddsa-interface";

export interface SignEd25519Round1Request {
  email: string;
  wallet_id: string;
  customer_id: string;
  msg: number[];
}

export interface SignEd25519Round1Response {
  session_id: string;
  commitments_0: CommitmentEntry;
}

export type SignEd25519Round1Body = {
  msg: number[];
};

export interface SignEd25519Round2Request {
  email: string;
  wallet_id: string;
  session_id: string;
  commitments_1: CommitmentEntry;
}

export interface SignEd25519Round2Response {
  signature_share_0: SignatureShareEntry;
}

export type SignEd25519Round2Body = {
  session_id: string;
  commitments_1: CommitmentEntry;
};

export interface SignEd25519AggregateRequest {
  email: string;
  wallet_id: string;
  msg: number[];
  all_commitments: CommitmentEntry[];
  all_signature_shares: SignatureShareEntry[];
  user_verifying_share: number[]; // P0's verifying_share (32 bytes)
}

export interface SignEd25519AggregateResponse {
  signature: number[];
}

export type SignEd25519AggregateBody = {
  msg: number[];
  all_commitments: CommitmentEntry[];
  all_signature_shares: SignatureShareEntry[];
  user_verifying_share: number[];
};

export interface SignEd25519ServerState {
  nonces: number[];
  identifier: number[];
}
