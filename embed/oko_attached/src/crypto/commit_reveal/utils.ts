/**
 * Commit-Reveal Session Utilities
 *
 * - Session ID generation (UUID v7)
 * - ECDHE keypair generation (ed25519/x25519)
 * - Token hash calculation
 * - Encryption key derivation
 */

import { v7 as uuidv7 } from "uuid";
import type { Bytes32 } from "@oko-wallet/bytes";
import {
  sha256,
  generateEddsaKeypair,
  deriveSessionKey,
  type EddsaKeypair,
  type EcdheSessionKey,
} from "@oko-wallet/crypto-js/browser";
import type { Result } from "@oko-wallet/stdlib-js";

/** Session timeout: 5 minutes */
export const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

// ============================================================================
// Session ID
// ============================================================================

/**
 * Generate session ID using UUID v7 (timestamp-ordered).
 */
export function generateSessionId(): string {
  return uuidv7();
}

// ============================================================================
// ECDHE Keypair
// ============================================================================

export type ClientEcdheKeypair = EddsaKeypair;

/**
 * Generate ECDHE keypair for commit-reveal session.
 * Uses ed25519 curve via @oko-wallet/crypto-js.
 */
export function generateClientKeypair(): Result<ClientEcdheKeypair, string> {
  return generateEddsaKeypair();
}

// ============================================================================
// Version Prefix
// ============================================================================

/**
 * Extract major version from semver string.
 * "1.2.3" -> "1"
 */
export function extractMajorVersion(sdkVersion: string): string {
  const parts = sdkVersion.split(".");
  return parts[0] ?? "0";
}

/**
 * Generate version prefix for key derivation.
 * "1.2.3" -> "oko-v1-"
 */
export function generateVersionPrefix(sdkVersion: string): string {
  const major = extractMajorVersion(sdkVersion);
  return `oko-v${major}-`;
}

// ============================================================================
// Token Hash
// ============================================================================

/**
 * Calculate token hash for commitment.
 * Formula: SHA256("oko-v{major}-" + oauth_token)
 */
export function calculateTokenHash(
  oauthToken: string,
  sdkVersion: string,
): Result<string, string> {
  const prefix = generateVersionPrefix(sdkVersion);
  const dataToHash = prefix + oauthToken;

  const hashResult = sha256(dataToHash);
  if (!hashResult.success) {
    return { success: false, err: hashResult.err };
  }

  return { success: true, data: hashResult.data.toHex() };
}

// ============================================================================
// Encryption Key Derivation
// ============================================================================

/**
 * Derive encryption key from ECDHE shared secret.
 * Formula: SHA256("oko-v{major}-" + shared_secret)
 */
export function deriveEncryptionKey(
  clientPrivateKey: Bytes32,
  counterPartyPublicKey: Bytes32,
  sdkVersion: string,
): Result<EcdheSessionKey, string> {
  const prefix = generateVersionPrefix(sdkVersion);
  return deriveSessionKey(clientPrivateKey, counterPartyPublicKey, prefix);
}

// ============================================================================
// Session Expiration
// ============================================================================

/**
 * Calculate session expiration time (now + 5 minutes).
 */
export function calculateExpiresAt(createdAt: Date = new Date()): Date {
  return new Date(createdAt.getTime() + SESSION_TIMEOUT_MS);
}

/**
 * Check if session has expired.
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
