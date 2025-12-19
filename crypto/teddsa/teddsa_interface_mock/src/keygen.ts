/**
 * Output from centralized key generation for a single participant
 */
export interface TeddsaKeygenOutput {
  /** Serialized FROST KeyPackage (contains private share) */
  key_package: number[];
  /** Serialized FROST PublicKeyPackage (shared among all participants) */
  public_key_package: number[];
  /** Participant identifier bytes */
  identifier: number[];
}

/**
 * Output from centralized key generation containing all shares
 */
export interface TeddsaCentralizedKeygenOutput {
  /** Original private key (only available during centralized keygen) */
  private_key: number[];
  /** Array of keygen outputs for each participant */
  keygen_outputs: TeddsaKeygenOutput[];
  /** Ed25519 public key (32 bytes) */
  public_key: number[];
}

/**
 * Client-side keygen state for TEdDSA
 */
export interface TeddsaClientKeygenState {
  /** First participant's keygen output (client) */
  keygen_1: TeddsaKeygenOutput | null;
  /** Second participant's keygen output (server) */
  keygen_2: TeddsaKeygenOutput | null;
  /** Ed25519 public key (32 bytes) */
  public_key: number[] | null;
}
