import type { TeddsaKeygenOutput } from "../keygen";

/**
 * Request body for TEdDSA keygen initialization
 */
export interface TeddsaKeygenInitRequest {
  /** User identifier */
  user_id: string;
}

/**
 * Response from TEdDSA keygen initialization
 */
export interface TeddsaKeygenInitResponse {
  /** Session ID for this keygen operation */
  session_id: string;
}

/**
 * Request body for storing client's keygen share on server
 */
export interface TeddsaKeygenStoreRequest {
  /** User identifier */
  user_id: string;
  /** Session ID from init */
  session_id: string;
  /** Server's keygen output (keygen_2) */
  keygen_output: TeddsaKeygenOutput;
  /** Ed25519 public key (32 bytes) */
  public_key: number[];
}

/**
 * Response from storing keygen share
 */
export interface TeddsaKeygenStoreResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Ed25519 public key (32 bytes) - confirmed */
  public_key: number[];
}
