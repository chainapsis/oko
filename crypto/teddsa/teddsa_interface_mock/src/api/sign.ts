import type {
  TeddsaCommitmentEntry,
  TeddsaSignatureShareEntry,
} from "../sign";

/**
 * Request body for TEdDSA sign round 1
 */
export interface TeddsaSignRound1Request {
  /** Session ID for this signing operation */
  session_id: string;
  /** Message to sign (as byte array) */
  message: number[];
  /** Client's commitment from round 1 */
  client_commitment: TeddsaCommitmentEntry;
}

/**
 * Response from TEdDSA sign round 1
 */
export interface TeddsaSignRound1Response {
  /** Server's commitment */
  server_commitment: TeddsaCommitmentEntry;
}

/**
 * Request body for TEdDSA sign round 2
 */
export interface TeddsaSignRound2Request {
  /** Session ID for this signing operation */
  session_id: string;
  /** Client's signature share */
  client_signature_share: TeddsaSignatureShareEntry;
}

/**
 * Response from TEdDSA sign round 2
 */
export interface TeddsaSignRound2Response {
  /** Server's signature share */
  server_signature_share: TeddsaSignatureShareEntry;
}

/**
 * Request body for TEdDSA signature aggregation (optional, can be done client-side)
 */
export interface TeddsaAggregateRequest {
  /** Session ID for this signing operation */
  session_id: string;
  /** Message that was signed */
  message: number[];
  /** All commitments from both participants */
  all_commitments: TeddsaCommitmentEntry[];
  /** All signature shares from both participants */
  all_signature_shares: TeddsaSignatureShareEntry[];
}

/**
 * Response from TEdDSA signature aggregation
 */
export interface TeddsaAggregateResponse {
  /** 64-byte Ed25519 signature */
  signature: number[];
}
