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
import {
  Bytes,
  type Bytes32,
  type Bytes33,
  type Bytes64,
} from "@oko-wallet/bytes";
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
): Bytes<65> {
  const bytes = new Uint8Array(65);
  bytes[0] = signature.v;
  bytes.set(signature.r.toUint8Array(), 1);
  bytes.set(signature.s.toUint8Array(), 33);
  const result = Bytes.fromUint8Array(bytes, 65);
  if (!result.success) {
    throw new Error(
      `Failed to convert ECDSA signature to bytes: ${result.err}`,
    );
  }
  return result.data;
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
 * @param signatureHex - Hex-encoded signature (64 bytes compact format)
 * @param publicKey - Compressed public key (33 bytes)
 * @returns True if signature is valid, false otherwise
 */
export function verifySignature(
  message: string,
  signature: EcdsaSignature,
  publicKey: Bytes33,
): Result<boolean, string> {
  try {
    // Hash the message
    const messageHash = sha256(new TextEncoder().encode(message));

    // Parse signature from hex
    const signatureBytes = Buffer.from(signatureHex, "hex");
    if (signatureBytes.length !== 64) {
      return {
        success: false,
        err: `Invalid signature length: expected 64 bytes, got ${signatureBytes.length}`,
      };
    }

    // Create signature object from compact format
    const signature = secp256k1.Signature.fromCompact(signatureBytes);

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
// export function isValidPublicKey(publicKey: Bytes33): boolean {
//   try {
//     const bytes = publicKey.toUint8Array();

//     // Check length
//     if (bytes.length !== 33) {
//       return false;
//     }

//     // Check first byte (0x02 or 0x03 for compressed)
//     if (bytes[0] !== 0x02 && bytes[0] !== 0x03) {
//       return false;
//     }

//     // Try to parse as point (will throw if invalid)
//     secp256k1.ProjectivePoint.fromHex(publicKey.toHex());

//     return true;
//   } catch {
//     return false;
//   }
// }

/**
 * Validate if a private key is valid secp256k1 private key
 * @param privateKey - Private key (32 bytes)
 * @returns True if valid, false otherwise
 */
// export function isValidPrivateKey(privateKey: Bytes32): boolean {
//   try {
//     const bytes = privateKey.toUint8Array();

//     // Check length
//     if (bytes.length !== 32) {
//       return false;
//     }

//     // Check if it's within valid range (1 to n-1, where n is the curve order)
//     const keyBigInt = privateKey.toBigInt();
//     if (keyBigInt === BigInt(0) || keyBigInt >= secp256k1.CURVE.n) {
//       return false;
//     }

//     return true;
//   } catch {
//     return false;
//   }
// }
