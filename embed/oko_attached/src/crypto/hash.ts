import { Bytes, type Bytes32 } from "@oko-wallet/bytes";
import { sha256 } from "@oko-wallet/crypto-js";
import type { Result } from "@oko-wallet/stdlib-js";

/**
 * Hash keyshare node names to get identifiers for secp256k1 SSS.
 * The hash is reduced to fit within the secp256k1 scalar field order.
 */
export async function hashKeyshareNodeNames(
  keyshareNodeNames: string[],
): Promise<Result<Bytes32[], string>> {
  const hashes = [];
  for (const name of keyshareNodeNames) {
    const hashResult = sha256(name);
    if (hashResult.success === false) {
      return {
        success: false,
        err: hashResult.err,
      };
    }
    const hash = hashResult.data;
    const hashU8Arr = new Uint8Array(hash.toUint8Array());
    // Set first byte to 0 for secp256k1 scalar compatibility (big-endian)
    // secp256k1 scalar order is ~2^256, so 248 bits of entropy is sufficient
    hashU8Arr[0] = 0;
    const bytesRes = Bytes.fromUint8Array(hashU8Arr, 32);
    if (bytesRes.success === false) {
      return {
        success: false,
        err: bytesRes.err,
      };
    }
    hashes.push(bytesRes.data);
  }

  return {
    success: true,
    data: hashes,
  };
}

/**
 * Hash keyshare node names to get identifiers for Ed25519 SSS.
 * The hash is reduced to fit within the Ed25519 scalar field order (~2^252).
 * Ed25519 uses little-endian byte order, so we reduce the most significant byte (byte 31).
 */
export async function hashKeyshareNodeNamesEd25519(
  keyshareNodeNames: string[],
): Promise<Result<Bytes32[], string>> {
  const hashes = [];
  for (const name of keyshareNodeNames) {
    const hashResult = sha256(name);
    if (hashResult.success === false) {
      return {
        success: false,
        err: hashResult.err,
      };
    }
    const hash = hashResult.data;
    const hashU8Arr = new Uint8Array(hash.toUint8Array());
    // Ed25519 scalar order is ~2^252 (specifically: 2^252 + 27742317777372353535851937790883648493)
    // In little-endian, byte 31 is the most significant byte.
    // Set byte 31 to 0x0F or less to ensure value is < 2^252
    // This gives us ~248 bits of entropy which is still cryptographically secure.
    hashU8Arr[31] = hashU8Arr[31] & 0x0f;
    const bytesRes = Bytes.fromUint8Array(hashU8Arr, 32);
    if (bytesRes.success === false) {
      return {
        success: false,
        err: bytesRes.err,
      };
    }
    hashes.push(bytesRes.data);
  }

  return {
    success: true,
    data: hashes,
  };
}
