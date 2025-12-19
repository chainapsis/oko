import type { Bytes32 } from "@oko-wallet/bytes";

/**
 * TEdDSA keygen output for a single participant
 */
export interface TeddsaKeygenOutputBytes {
  /** Serialized KeyPackage (contains private share) */
  key_package: Uint8Array;
  /** Serialized PublicKeyPackage (shared among all participants) */
  public_key_package: Uint8Array;
  /** Participant identifier */
  identifier: Uint8Array;
  /** Ed25519 public key (32 bytes) */
  public_key: Bytes32;
}

/**
 * TEdDSA keygen result containing shares for both participants
 */
export interface TeddsaKeygenResult {
  keygen_1: TeddsaKeygenOutputBytes;
  keygen_2: TeddsaKeygenOutputBytes;
}

/**
 * Raw keygen output from WASM module
 */
export interface TeddsaCentralizedKeygenOutput {
  private_key: number[];
  keygen_outputs: TeddsaKeygenOutput[];
  public_key: number[];
}

/**
 * Single keygen output from WASM
 */
export interface TeddsaKeygenOutput {
  key_package: number[];
  public_key_package: number[];
  identifier: number[];
}

/**
 * Sign round 1 output from WASM
 */
export interface TeddsaSignRound1Output {
  nonces: number[];
  commitments: number[];
  identifier: number[];
}

/**
 * Sign round 2 output from WASM
 */
export interface TeddsaSignRound2Output {
  signature_share: number[];
  identifier: number[];
}

/**
 * Aggregate output from WASM
 */
export interface TeddsaAggregateOutput {
  signature: number[];
}

/**
 * Commitment entry for signing
 */
export interface CommitmentEntry {
  identifier: number[];
  commitments: number[];
}

/**
 * Signature share entry for aggregation
 */
export interface SignatureShareEntry {
  identifier: number[];
  signature_share: number[];
}
