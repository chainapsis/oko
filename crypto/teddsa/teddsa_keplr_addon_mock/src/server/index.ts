import type {
  TeddsaKeygenOutput,
  TeddsaCentralizedKeygenOutput,
  TeddsaSignRound1Output,
  TeddsaSignRound2Output,
  TeddsaAggregateOutput,
  TeddsaCommitmentEntry,
  TeddsaSignatureShareEntry,
} from "@oko-wallet/teddsa-interface-mock";

// Import from the native addon
// Note: The addon must be built first with `npm run build:addon`
import {
  napiKeygenCentralizedEd25519,
  napiKeygenImportEd25519,
  napiSignRound1Ed25519,
  napiSignRound2Ed25519,
  napiAggregateEd25519,
  napiVerifyEd25519,
} from "../../addon/index.js";

/**
 * Generate a 2-of-2 threshold Ed25519 key using centralized key generation.
 */
export function runKeygenCentralizedEd25519(): TeddsaCentralizedKeygenOutput {
  try {
    return napiKeygenCentralizedEd25519();
  } catch (err: any) {
    console.error("Error calling runKeygenCentralizedEd25519:", err.message);
    throw err;
  }
}

/**
 * Import an existing Ed25519 secret key and split it into threshold shares.
 */
export function runKeygenImportEd25519(
  secretKey: Uint8Array,
): TeddsaCentralizedKeygenOutput {
  try {
    return napiKeygenImportEd25519(Array.from(secretKey));
  } catch (err: any) {
    console.error("Error calling runKeygenImportEd25519:", err.message);
    throw err;
  }
}

/**
 * Generate signing commitments for a participant (Round 1).
 */
export function runSignRound1Ed25519(
  keyPackage: Uint8Array,
): TeddsaSignRound1Output {
  try {
    return napiSignRound1Ed25519(Array.from(keyPackage));
  } catch (err: any) {
    console.error("Error calling runSignRound1Ed25519:", err.message);
    throw err;
  }
}

/**
 * Generate a signature share for a participant (Round 2).
 */
export function runSignRound2Ed25519(
  message: Uint8Array,
  keyPackage: Uint8Array,
  nonces: Uint8Array,
  allCommitments: TeddsaCommitmentEntry[],
): TeddsaSignRound2Output {
  try {
    return napiSignRound2Ed25519(
      Array.from(message),
      Array.from(keyPackage),
      Array.from(nonces),
      allCommitments,
    );
  } catch (err: any) {
    console.error("Error calling runSignRound2Ed25519:", err.message);
    throw err;
  }
}

/**
 * Aggregate signature shares into a final Ed25519 signature.
 */
export function runAggregateEd25519(
  message: Uint8Array,
  allCommitments: TeddsaCommitmentEntry[],
  allSignatureShares: TeddsaSignatureShareEntry[],
  publicKeyPackage: Uint8Array,
): TeddsaAggregateOutput {
  try {
    return napiAggregateEd25519(
      Array.from(message),
      allCommitments,
      allSignatureShares,
      Array.from(publicKeyPackage),
    );
  } catch (err: any) {
    console.error("Error calling runAggregateEd25519:", err.message);
    throw err;
  }
}

/**
 * Verify an Ed25519 signature.
 */
export function runVerifyEd25519(
  message: Uint8Array,
  signature: Uint8Array,
  publicKeyPackage: Uint8Array,
): boolean {
  try {
    return napiVerifyEd25519(
      Array.from(message),
      Array.from(signature),
      Array.from(publicKeyPackage),
    );
  } catch (err: any) {
    console.error("Error calling runVerifyEd25519:", err.message);
    throw err;
  }
}
