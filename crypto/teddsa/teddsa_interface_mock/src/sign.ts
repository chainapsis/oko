/**
 * Output from signing round 1
 */
export interface TeddsaSignRound1Output {
  /** Serialized nonces (keep secret, use in round 2) */
  nonces: number[];
  /** Serialized commitments (send to other participants) */
  commitments: number[];
  /** Participant identifier */
  identifier: number[];
}

/**
 * Output from signing round 2
 */
export interface TeddsaSignRound2Output {
  /** Participant's signature share */
  signature_share: number[];
  /** Participant identifier */
  identifier: number[];
}

/**
 * Commitment entry for signing protocol
 */
export interface TeddsaCommitmentEntry {
  /** Participant identifier */
  identifier: number[];
  /** Serialized commitments */
  commitments: number[];
}

/**
 * Signature share entry for aggregation
 */
export interface TeddsaSignatureShareEntry {
  /** Participant identifier */
  identifier: number[];
  /** Serialized signature share */
  signature_share: number[];
}

/**
 * Output from signature aggregation
 */
export interface TeddsaAggregateOutput {
  /** 64-byte Ed25519 signature */
  signature: number[];
}

/**
 * Final Ed25519 signature
 */
export interface TeddsaSignature {
  /** 64-byte Ed25519 signature as hex string */
  signature: string;
}

/**
 * Client-side sign state for TEdDSA
 */
export interface TeddsaClientSignState {
  /** Message being signed */
  message: Uint8Array | null;
  /** Client's nonces from round 1 */
  nonces: number[] | null;
  /** Client's commitments from round 1 */
  commitments: number[] | null;
  /** All participants' commitments */
  all_commitments: TeddsaCommitmentEntry[] | null;
  /** All participants' signature shares */
  all_signature_shares: TeddsaSignatureShareEntry[] | null;
}
