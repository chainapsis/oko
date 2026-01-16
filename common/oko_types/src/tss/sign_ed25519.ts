import type { CommitmentEntry, SignatureShareEntry } from "@oko-wallet-types/teddsa";

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

export interface SignEd25519ServerState {
  nonces: number[];
  identifier: number[];
}
