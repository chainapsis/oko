import { Bytes, type Bytes32, type Bytes64 } from "@oko-wallet/bytes";

export interface RunExpandSharesResult {
  t: number;
  reshared_user_key_shares: UserKeySharePointByNode[];
  original_secret: Bytes32;
}
export interface NodeNameAndEndpoint {
  name: string;
  endpoint: string;
}

export interface UserKeySharePointByNode {
  node: NodeNameAndEndpoint;
  share: Point256;
}

export interface Point256 {
  x: Bytes32;
  y: Bytes32;
}

export interface PointNumArr {
  x: number[];
  y: number[];
}

/**
 * TEDDSA key share for KS Node storage.
 *
 * identifier: 32 bytes - SSS x-coordinate (node_name SHA256, byte[31] &= 0x0F)
 * signing_share: 32 bytes - SSS y-coordinate (split signing share)
 *
 * Note: verifying_share is NOT stored.
 * It can be recovered from signing_share via scalar_base_mult().
 *
 * Total: 64 bytes (same size as Point256)
 */
export interface TeddsaKeyShare {
  identifier: Bytes32;
  signing_share: Bytes32;
}

export interface TeddsaKeyShareByNode {
  node: NodeNameAndEndpoint;
  share: TeddsaKeyShare;
}

/**
 * Serialize TeddsaKeyShare to Bytes64.
 * Format: identifier (32 bytes) || signing_share (32 bytes)
 */
export function teddsaKeyShareToBytes64(share: TeddsaKeyShare): Bytes64 {
  const combined = new Uint8Array(64);
  combined.set(share.identifier.toUint8Array(), 0);
  combined.set(share.signing_share.toUint8Array(), 32);

  const result = Bytes.fromUint8Array(combined, 64);
  if (!result.success) {
    throw new Error(`Failed to create Bytes64: ${result.err}`);
  }
  return result.data;
}

/**
 * Deserialize Bytes64 to TeddsaKeyShare.
 */
export function bytes64ToTeddsaKeyShare(bytes: Bytes64): TeddsaKeyShare {
  const arr = bytes.toUint8Array();

  const identifierResult = Bytes.fromUint8Array(arr.slice(0, 32), 32);
  if (!identifierResult.success) {
    throw new Error(`Failed to extract identifier: ${identifierResult.err}`);
  }

  const signingResult = Bytes.fromUint8Array(arr.slice(32, 64), 32);
  if (!signingResult.success) {
    throw new Error(`Failed to extract signing_share: ${signingResult.err}`);
  }

  return {
    identifier: identifierResult.data,
    signing_share: signingResult.data,
  };
}

/**
 * Convert TeddsaKeyShare to 128-char hex string (for KS node API).
 */
export function teddsaKeyShareToHex(share: TeddsaKeyShare): string {
  return teddsaKeyShareToBytes64(share).toHex();
}

/**
 * Convert 128-char hex string to TeddsaKeyShare.
 */
export function hexToTeddsaKeyShare(hex: string): TeddsaKeyShare {
  const bytesResult = Bytes.fromHexString(hex, 64);
  if (!bytesResult.success) {
    throw new Error(
      `Invalid hex string for TeddsaKeyShare: ${bytesResult.err}`,
    );
  }
  return bytes64ToTeddsaKeyShare(bytesResult.data);
}

/**
 * Convert TeddsaKeyShare to Point256 (same structure, different semantics).
 * Use when reusing existing Ed25519 functions.
 */
export function teddsaKeyShareToPoint256(share: TeddsaKeyShare): Point256 {
  return {
    x: share.identifier,
    y: share.signing_share,
  };
}

/**
 * Convert Point256 to TeddsaKeyShare.
 */
export function point256ToTeddsaKeyShare(point: Point256): TeddsaKeyShare {
  return {
    identifier: point.x,
    signing_share: point.y,
  };
}
