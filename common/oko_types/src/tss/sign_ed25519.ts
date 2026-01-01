import type {
  TeddsaSignRound1Output,
  TeddsaSignRound2Output,
  TeddsaCommitmentEntry,
  TeddsaSignatureShareEntry,
} from "@oko-wallet/teddsa-interface";

export interface SignEd25519Round1Request {
  email: string;
  wallet_id: string;
  customer_id: string;
  msg: number[];
}

export interface SignEd25519Round1Response {
  session_id: string;
  commitments_0: TeddsaCommitmentEntry;
}

export type SignEd25519Round1Body = {
  msg: number[];
};

export interface SignEd25519Round2Request {
  email: string;
  wallet_id: string;
  session_id: string;
  commitments_1: TeddsaCommitmentEntry;
}

export interface SignEd25519Round2Response {
  signature_share_0: TeddsaSignatureShareEntry;
}

export type SignEd25519Round2Body = {
  session_id: string;
  commitments_1: TeddsaCommitmentEntry;
};

export interface SignEd25519AggregateRequest {
  email: string;
  wallet_id: string;
  msg: number[];
  all_commitments: TeddsaCommitmentEntry[];
  all_signature_shares: TeddsaSignatureShareEntry[];
}

export interface SignEd25519AggregateResponse {
  signature: number[];
}

export type SignEd25519AggregateBody = {
  msg: number[];
  all_commitments: TeddsaCommitmentEntry[];
  all_signature_shares: TeddsaSignatureShareEntry[];
};

export interface SignEd25519ServerState {
  nonces: number[];
  identifier: number[];
}

// ============================================
// Presign Ed25519 Types (message-independent)
// ============================================

export interface PresignEd25519Request {
  email: string;
  wallet_id: string;
  customer_id: string;
}

export interface PresignEd25519Response {
  session_id: string;
  commitments_0: TeddsaCommitmentEntry;
}

export type PresignEd25519Body = Record<string, never>;

// ============================================
// Sign Ed25519 Types (using presign session)
// ============================================

export interface SignEd25519Request {
  email: string;
  wallet_id: string;
  session_id: string;
  msg: number[];
  commitments_1: TeddsaCommitmentEntry;
}

export interface SignEd25519Response {
  signature_share_0: TeddsaSignatureShareEntry;
}

export type SignEd25519Body = {
  session_id: string;
  msg: number[];
  commitments_1: TeddsaCommitmentEntry;
};
