// TODO: @chemonoworld refactor this to replace deprecated functions

/**
 * ECDSA Keypair Management using secp256k1 curve
 * Used for signing rollback instructions in commit-reveal scheme
 *
 * Uses @noble/curves for cryptographic operations
 * Uses @oko-wallet/bytes for type-safe byte handling
 */

import type { ECDSASignOpts } from "@noble/curves/abstract/weierstrass.js";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2";
import { Bytes, type Bytes32, type Bytes33 } from "@oko-wallet/bytes";
import type { Result } from "@oko-wallet/stdlib-js";

export interface EcdsaKeypair {
  privateKey: Bytes32;
  publicKey: Bytes33;
}

/**
 * Generate a new ECDSA keypair using secp256k1 curve
 * @returns Keypair with private key (32 bytes) and compressed public key (33 bytes)
 */
export function generateECDSAKeypair(): Result<EcdsaKeypair, string> {
  try {
    const keygen = secp256k1.keygen();

    const privateKeyResult = Bytes.fromUint8Array(keygen.secretKey, 32);
    if (!privateKeyResult.success) {
      return {
        success: false,
        err: `Failed to parse private key: ${privateKeyResult.err}`,
      };
    }

    const publicKeyResult = Bytes.fromUint8Array(keygen.publicKey, 33);
    if (!publicKeyResult.success) {
      return {
        success: false,
        err: `Failed to parse public key: ${publicKeyResult.err}`,
      };
    }

    return {
      success: true,
      data: {
        privateKey: privateKeyResult.data as Bytes32,
        publicKey: publicKeyResult.data as Bytes33,
      },
    };
  } catch (error) {
    return {
      success: false,
      err: `Failed to generate ECDSA keypair: ${String(error)}`,
    };
  }
}

export interface EcdsaSignature {
  v: 0 | 1;
  r: Bytes32;
  s: Bytes32;
}

export function convertEcdsaSignatureToBytes(
  signature: EcdsaSignature,
): Result<Bytes<65>, string> {
  try {
    const bytes = new Uint8Array(65);
    bytes[0] = signature.v;
    bytes.set(signature.r.toUint8Array(), 1);
    bytes.set(signature.s.toUint8Array(), 33);
    const result = Bytes.fromUint8Array(bytes, 65);
    if (!result.success) {
      return {
        success: false,
        err: `Failed to convert ECDSA signature to bytes: ${result.err}`,
      };
    }
    return {
      success: true,
      data: result.data as Bytes<65>,
    };
  } catch (error) {
    return {
      success: false,
      err: `Failed to convert ECDSA signature to bytes: ${String(error)}`,
    };
  }
}

/**
 * Sign a message using ECDSA (secp256k1)
 * @param message - Message to sign (will be hashed with SHA-256)
 * @param privateKey - Private key (32 bytes)
 * @returns Hex-encoded signature (64 bytes compact format)
 */
export function signMessage(
  message: string,
  privateKey: Bytes32,
  opts: ECDSASignOpts = {
    format: "recovered",
  },
): Result<EcdsaSignature, string> {
  try {
    const messageHash = sha256(new TextEncoder().encode(message));

    const signature = secp256k1.sign(
      messageHash,
      privateKey.toUint8Array(),
      opts,
    );

    const r = Bytes.fromUint8Array(signature.slice(1, 33), 32);
    if (!r.success) {
      return {
        success: false,
        err: `Failed to parse r: ${r.err}`,
      };
    }
    const s = Bytes.fromUint8Array(signature.slice(33, 65), 32);
    if (!s.success) {
      return {
        success: false,
        err: `Failed to parse s: ${s.err}`,
      };
    }

    if (signature[0] !== 0 && signature[0] !== 1) {
      return {
        success: false,
        err: `Invalid recovery byte: ${signature[0]}`,
      };
    }

    return {
      success: true,
      data: {
        v: signature[0],
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
 * Verify an ECDSA signature
 * @param message - Original message
 * @param signature - Hex-encoded signature (64 bytes compact format)
 * @param publicKey - Compressed public key (33 bytes)
 * @returns True if signature is valid, false otherwise
 */
export function verifySignature(
  message: string,
  sig: EcdsaSignature,
  publicKey: Bytes33,
): Result<boolean, string> {
  try {
    const messageHash = sha256(new TextEncoder().encode(message));

    const signatureBytesResult = convertEcdsaSignatureToBytes(sig);
    if (!signatureBytesResult.success) {
      return {
        success: false,
        err: `Failed to convert ECDSA signature to bytes: ${signatureBytesResult.err}`,
      };
    }

    // Create signature object from compact format
    const signature = secp256k1.Signature.fromBytes(
      signatureBytesResult.data.toUint8Array(),
    );

    // Verify signature
    const isValid = secp256k1.verify(
      signature.toBytes(),
      messageHash,
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
 * Validate if a public key is valid secp256k1 compressed public key
 * @param publicKey - Compressed public key (33 bytes)
 * @returns True if valid, false otherwise
 */
export function isValidPublicKey(publicKey: Bytes33): boolean {
  try {
    const bytes = publicKey.toUint8Array();

    if (bytes[0] !== 0x02 && bytes[0] !== 0x03) {
      return false;
    }

    secp256k1.Point.fromHex(publicKey.toHex());

    return true;
  } catch {
    return false;
  }
}
