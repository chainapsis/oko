/**
 * ed25519 Keypair Management
 * Used for signing rollback instructions in commit-reveal scheme
 *
 * Uses @noble/curves for cryptographic operations
 * Uses @oko-wallet/bytes for type-safe byte handling
 */

import { ed25519 } from "@noble/curves/ed25519.js";
import { Bytes, type Bytes32 } from "@oko-wallet/bytes";
import type { Result } from "@oko-wallet/stdlib-js";

import { sha256 } from "../hash";

export interface EddsaKeypair {
  privateKey: Bytes32;
  publicKey: Bytes32;
}

/**
 * Generate a new ed25519 keypair
 * @returns Keypair with private key (32 bytes) and public key (32 bytes)
 */
export function generateEddsaKeypair(): Result<EddsaKeypair, string> {
  try {
    const keygen = ed25519.keygen();

    const privateKeyResult = Bytes.fromUint8Array(keygen.secretKey, 32);
    if (!privateKeyResult.success) {
      return {
        success: false,
        err: `Failed to parse private key: ${privateKeyResult.err}`,
      };
    }

    const publicKeyResult = Bytes.fromUint8Array(keygen.publicKey, 32);
    if (!publicKeyResult.success) {
      return {
        success: false,
        err: `Failed to parse public key: ${publicKeyResult.err}`,
      };
    }

    return {
      success: true,
      data: {
        privateKey: privateKeyResult.data,
        publicKey: publicKeyResult.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      err: `Failed to generate ECDSA keypair: ${String(error)}`,
    };
  }
}

export interface EddsaSignature {
  r: Bytes32;
  s: Bytes32;
}

export function convertEddsaSignatureToBytes(
  signature: EddsaSignature,
): Result<Bytes<64>, string> {
  try {
    const bytes = new Uint8Array(64);
    bytes.set(signature.r.toUint8Array(), 0);
    bytes.set(signature.s.toUint8Array(), 32);
    const result = Bytes.fromUint8Array(bytes, 64);
    if (!result.success) {
      return {
        success: false,
        err: `Failed to convert ECDSA signature to bytes: ${result.err}`,
      };
    }
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      err: `Failed to convert ECDSA signature to bytes: ${String(error)}`,
    };
  }
}

export interface EddsaSignOpts {
  context?: Uint8Array;
}

/**
 * Sign a message using ed25519
 * @param message - Message to sign (will be hashed with SHA-256)
 * @param privateKey - Private key (32 bytes)
 * @returns Signature (64 bytes compact format)
 */
export function signMessage(
  message: string,
  privateKey: Bytes32,
  eddsaOpts: EddsaSignOpts = {},
): Result<EddsaSignature, string> {
  try {
    const messageHashRes = sha256(message);
    if (!messageHashRes.success) {
      return {
        success: false,
        err: `Failed to hash message: ${messageHashRes.err}`,
      };
    }
    const messageHash = messageHashRes.data;

    const signature = ed25519.sign(
      messageHash.toUint8Array(),
      privateKey.toUint8Array(),
      eddsaOpts,
    );

    const r = Bytes.fromUint8Array(signature.slice(0, 32), 32);
    if (!r.success) {
      return {
        success: false,
        err: `Failed to parse r: ${r.err}`,
      };
    }
    const s = Bytes.fromUint8Array(signature.slice(32, 64), 32);
    if (!s.success) {
      return {
        success: false,
        err: `Failed to parse s: ${s.err}`,
      };
    }

    return {
      success: true,
      data: {
        r: r.data,
        s: s.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      err: `Failed to sign message: ${String(error)}`,
    };
  }
}

/**
 * Verify an ed25519 signature
 * @param message - Original message
 * @param signature - Signature (64 bytes compact format)
 * @param publicKey - compressed public key (32 bytes)
 * @returns True if signature is valid, false otherwise(if verification \
 fails or out of range error occurs)
 * success: true, data: true -> signature is valid
 */
export function verifySignature(
  message: string,
  sig: EddsaSignature,
  publicKey: Bytes32,
): Result<boolean, string> {
  try {
    const messageHashRes = sha256(message);
    if (!messageHashRes.success) {
      return {
        success: false,
        err: `Failed to hash message: ${messageHashRes.err}`,
      };
    }
    const messageHash = messageHashRes.data;

    const signatureBytesResult = convertEddsaSignatureToBytes(sig);
    if (!signatureBytesResult.success) {
      return {
        success: false,
        err: `Failed to convert ECDSA signature to bytes: \
${signatureBytesResult.err}`,
      };
    }

    const isValid = ed25519.verify(
      signatureBytesResult.data.toUint8Array(),
      messageHash.toUint8Array(),
      publicKey.toUint8Array(),
    );

    return {
      success: true,
      data: isValid,
    };
  } catch (error) {
    return {
      success: false,
      err: `Failed to verify signature: ${String(error)}`,
    };
  }
}

/**
 * Validate if a public key is valid ed25519 compressed public key
 * @param publicKey - public key (32 bytes)
 * @returns True if valid, false otherwise
 * success: true, data: true -> public key is valid
 */
export function isValidPublicKey(publicKey: Bytes32): Result<boolean, string> {
  try {
    const bytes = publicKey.toUint8Array();

    const isValid = ed25519.utils.isValidPublicKey(bytes);

    return {
      success: true,
      data: isValid,
    };
  } catch (error) {
    return {
      success: false,
      err: `Failed to validate public key: ${String(error)}`,
    };
  }
}
