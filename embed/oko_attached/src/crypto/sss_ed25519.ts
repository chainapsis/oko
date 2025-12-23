import type { KeyShareNodeMetaWithNodeStatusInfo } from "@oko-wallet/oko-types/tss";
import { wasmModule } from "@oko-wallet/teddsa-wasm";
import { Bytes, type Bytes32 } from "@oko-wallet/bytes";
import type {
  PointNumArr,
  UserKeySharePointByNode,
} from "@oko-wallet/oko-types/user_key_share";
import type { TeddsaKeygenOutputBytes } from "@oko-wallet/teddsa-hooks";
import type { Result } from "@oko-wallet/stdlib-js";

import { hashKeyshareNodeNamesEd25519 } from "./hash";

/**
 * Data structure for Ed25519 key share backup on KS nodes.
 * Contains the SSS split of signing_share along with public info needed for reconstruction.
 */
export interface Ed25519KeyShareBackup {
  /** SSS split point (x: identifier, y: share) */
  share: {
    x: Bytes32;
    y: Bytes32;
  };
  /** Serialized PublicKeyPackage (needed for reconstruction) */
  publicKeyPackage: string; // hex string
  /** Participant identifier (needed for reconstruction) */
  identifier: string; // hex string
  /** Ed25519 public key (for verification) */
  publicKey: string; // hex string
}

/**
 * Split Ed25519 key package for backup on Key Share Nodes.
 *
 * Extracts the signing_share from the key_package and splits it using SSS.
 * Also includes the public information needed to reconstruct the key_package.
 */
export async function splitUserKeySharesEd25519(
  keygen_1: TeddsaKeygenOutputBytes,
  keyshareNodeMeta: KeyShareNodeMetaWithNodeStatusInfo,
): Promise<Result<UserKeySharePointByNode[], string>> {
  try {
    const keyPackageBytes = [...keygen_1.key_package];

    // Extract signing_share from key_package (32-byte scalar)
    const signingShareArr: number[] =
      wasmModule.extract_signing_share(keyPackageBytes);

    // Hash KS node names to get identifiers for SSS (Ed25519-compatible)
    const keyshareNodeHashesRes = await hashKeyshareNodeNamesEd25519(
      keyshareNodeMeta.nodes.map((meta) => meta.name),
    );
    if (keyshareNodeHashesRes.success === false) {
      return {
        success: false,
        err: keyshareNodeHashesRes.err,
      };
    }
    const keyshareNodeHashes = keyshareNodeHashesRes.data.map((bytes) => {
      return [...bytes.toUint8Array()];
    });

    // Split signing_share using SSS
    const splitPoints: PointNumArr[] = wasmModule.sss_split(
      signingShareArr,
      keyshareNodeHashes,
      keyshareNodeMeta.threshold,
    );

    // Convert to UserKeySharePointByNode format
    const shares: UserKeySharePointByNode[] = splitPoints.map(
      (point: PointNumArr, index: number) => {
        const xBytesRes = Bytes.fromUint8Array(
          Uint8Array.from([...point.x]),
          32,
        );
        if (xBytesRes.success === false) {
          throw new Error(xBytesRes.err);
        }
        const yBytesRes = Bytes.fromUint8Array(
          Uint8Array.from([...point.y]),
          32,
        );
        if (yBytesRes.success === false) {
          throw new Error(yBytesRes.err);
        }
        return {
          node: {
            name: keyshareNodeMeta.nodes[index].name,
            endpoint: keyshareNodeMeta.nodes[index].endpoint,
          },
          share: {
            x: xBytesRes.data,
            y: yBytesRes.data,
          },
        };
      },
    );

    return {
      success: true,
      data: shares,
    };
  } catch (error: any) {
    return {
      success: false,
      err: `splitUserKeySharesEd25519 failed: ${String(error)}`,
    };
  }
}

/**
 * Combine Ed25519 key shares to recover the signing_share.
 */
export async function combineUserSharesEd25519(
  userKeySharePoints: UserKeySharePointByNode[],
  threshold: number,
): Promise<Result<Uint8Array, string>> {
  try {
    if (threshold < 2) {
      return {
        success: false,
        err: "Threshold must be at least 2",
      };
    }

    if (userKeySharePoints.length < threshold) {
      return {
        success: false,
        err: "Number of user key shares is less than threshold",
      };
    }

    const points: PointNumArr[] = userKeySharePoints.map(
      (userKeySharePoint) => ({
        x: [...userKeySharePoint.share.x.toUint8Array()],
        y: [...userKeySharePoint.share.y.toUint8Array()],
      }),
    );

    // Combine shares to recover signing_share
    const combinedSigningShare: number[] = wasmModule.sss_combine(
      points,
      threshold,
    );

    return {
      success: true,
      data: Uint8Array.from(combinedSigningShare),
    };
  } catch (e) {
    return {
      success: false,
      err: `combineUserSharesEd25519 failed: ${String(e)}`,
    };
  }
}

/**
 * Reconstruct a full KeyPackage from a recovered signing_share and public info.
 */
export async function reconstructKeyPackageEd25519(
  signingShare: Uint8Array,
  publicKeyPackage: Uint8Array,
  identifier: Uint8Array,
): Promise<Result<Uint8Array, string>> {
  try {
    const keyPackageArr: number[] = wasmModule.reconstruct_key_package(
      [...signingShare],
      [...publicKeyPackage],
      [...identifier],
    );

    return {
      success: true,
      data: Uint8Array.from(keyPackageArr),
    };
  } catch (e) {
    return {
      success: false,
      err: `reconstructKeyPackageEd25519 failed: ${String(e)}`,
    };
  }
}

/**
 * Full recovery of Ed25519 keygen output from KS node shares.
 *
 * Given the SSS shares from KS nodes plus the stored public info,
 * reconstructs the complete TeddsaKeygenOutputBytes.
 */
export async function recoverEd25519Keygen(
  userKeySharePoints: UserKeySharePointByNode[],
  threshold: number,
  publicKeyPackage: Uint8Array,
  identifier: Uint8Array,
  publicKey: Bytes32,
): Promise<Result<TeddsaKeygenOutputBytes, string>> {
  try {
    // Combine shares to recover signing_share
    const combineRes = await combineUserSharesEd25519(
      userKeySharePoints,
      threshold,
    );
    if (!combineRes.success) {
      return {
        success: false,
        err: combineRes.err,
      };
    }

    // Reconstruct key_package from signing_share + public info
    const reconstructRes = await reconstructKeyPackageEd25519(
      combineRes.data,
      publicKeyPackage,
      identifier,
    );
    if (!reconstructRes.success) {
      return {
        success: false,
        err: reconstructRes.err,
      };
    }

    return {
      success: true,
      data: {
        key_package: reconstructRes.data,
        public_key_package: publicKeyPackage,
        identifier: identifier,
        public_key: publicKey,
      },
    };
  } catch (e) {
    return {
      success: false,
      err: `recoverEd25519Keygen failed: ${String(e)}`,
    };
  }
}
