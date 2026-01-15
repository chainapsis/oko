import type { KeyPackageRaw, PublicKeyPackageRaw } from "./keygen";

export interface SignInitRequest {
  session_id: string;
  message: number[];
}

export interface SignInitResponse {
  sign_session_id: string;
}

export interface SignRound1Request {
  sign_session_id: string;
  client_commitment: CommitmentEntry;
}

export interface SignRound1Response {
  server_commitment: CommitmentEntry;
}

export interface SignRound2Request {
  sign_session_id: string;
  client_signature_share: SignatureShareEntry;
}

export interface SignRound2Response {
  server_signature_share: SignatureShareEntry;
}

export interface SigningCommitmentOutput {
  nonces: number[];
  commitments: number[];
  identifier: number[];
}

export interface SignatureShareOutput {
  signature_share: number[];
  identifier: number[];
}

export interface CommitmentEntry {
  identifier: number[];
  commitments: number[];
}

export interface SignatureShareEntry {
  identifier: number[];
  signature_share: number[];
}

export interface SignRound1Input {
  key_package: KeyPackageRaw;
}

export interface SignRound2Input {
  message: number[];
  key_package: KeyPackageRaw;
  nonces: number[];
  all_commitments: CommitmentEntry[];
}

export interface AggregateInput {
  message: number[];
  all_commitments: CommitmentEntry[];
  all_signature_shares: SignatureShareEntry[];
  public_key_package: PublicKeyPackageRaw;
}

export interface SignatureOutput {
  signature: number[];
}

export interface VerifyInput {
  message: number[];
  signature: number[];
  public_key_package: PublicKeyPackageRaw;
}

export interface ClientSignState {
  message: number[] | null;
  key_package: KeyPackageRaw | null;
  public_key_package: PublicKeyPackageRaw | null;
  nonces: number[] | null;
  commitments: number[] | null;
  all_commitments: CommitmentEntry[] | null;
  all_signature_shares: SignatureShareEntry[] | null;
}
