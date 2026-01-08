// NOTE: Raw types are direct WASM I/O format using number[] for byte arrays

import type { KeyPackageRaw, PublicKeyPackageRaw } from "./keygen";

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
