import type { KeyShareNodeMetaWithNodeStatusInfo } from "@oko-wallet/oko-types/tss";
import type { NodeNameAndEndpoint } from "@oko-wallet/oko-types/user";
import { wasmModule } from "@oko-wallet/frost-ed25519-keplr-wasm";
import { Bytes, type Bytes32 } from "@oko-wallet/bytes";
import type { TeddsaKeyShareByNode } from "@oko-wallet/oko-types/user_key_share";
import type { Result } from "@oko-wallet/stdlib-js";
import type { KeyPackage } from "@oko-wallet/teddsa-interface";
import type {
  KeyPackageRaw,
  PublicKeyPackageRaw,
} from "@oko-wallet/oko-types/teddsa";

import { hashKeyshareNodeNamesEd25519 } from "./hash";
import { computeVerifyingShare } from "./scalar";

interface SplitOutputRaw {
  key_packages: KeyPackageRaw[];
  public_key_package: PublicKeyPackageRaw;
}

/**
 * Split client signing_share using SSS for KS node distribution.
 *
 * Uses FROST's sss_split to split the signing_share.
 * Extracts identifier and signing_share from each KeyPackage.
 *
 * @param signingShare - FROST KeyPackage's signing_share (32 bytes)
 * @param keyshareNodeMeta - KS Node metadata (nodes, threshold)
 * @returns TeddsaKeyShareByNode[] - (identifier, signing_share) pairs per node
 */
export async function splitTeddsaSigningShare(
  signingShare: Bytes32,
  keyshareNodeMeta: KeyShareNodeMetaWithNodeStatusInfo,
): Promise<Result<TeddsaKeyShareByNode[], string>> {
  try {
    const signingShareArr = [...signingShare.toUint8Array()];

    const identifiersRes = await hashKeyshareNodeNamesEd25519(
      keyshareNodeMeta.nodes.map((n) => n.name),
    );
    if (!identifiersRes.success) {
      return { success: false, err: identifiersRes.err };
    }

    const identifiers = identifiersRes.data.map((b) => [...b.toUint8Array()]);

    const splitOutput: SplitOutputRaw = wasmModule.sss_split(
      signingShareArr,
      identifiers,
      keyshareNodeMeta.threshold,
    );

    const shares: TeddsaKeyShareByNode[] = splitOutput.key_packages.map(
      (kp, i) => {
        const idBytes = Bytes.fromUint8Array(new Uint8Array(kp.identifier), 32);
        const shareBytes = Bytes.fromUint8Array(
          new Uint8Array(kp.signing_share),
          32,
        );

        if (!idBytes.success) throw new Error(idBytes.err);
        if (!shareBytes.success) throw new Error(shareBytes.err);

        return {
          node: {
            name: keyshareNodeMeta.nodes[i].name,
            endpoint: keyshareNodeMeta.nodes[i].endpoint,
          },
          share: {
            identifier: idBytes.data,
            signing_share: shareBytes.data,
          },
        };
      },
    );

    return { success: true, data: shares };
  } catch (e) {
    return {
      success: false,
      err: `splitTeddsaSigningShare failed: ${String(e)}`,
    };
  }
}

/**
 * Combine shares from KS nodes to recover signing_share.
 *
 * Converts TeddsaKeyShares to KeyPackageRaw format for sss_combine.
 *
 * @param shares - TeddsaKeyShare array from KS nodes
 * @param threshold - SSS threshold (minimum shares required)
 * @param verifyingKey - PublicKeyPackage's verifying_key (needed for KeyPackageRaw)
 * @returns signing_share (32 bytes)
 */
export async function combineTeddsaShares(
  shares: TeddsaKeyShareByNode[],
  threshold: number,
  verifyingKey: Bytes32,
): Promise<Result<Bytes32, string>> {
  try {
    if (shares.length < threshold) {
      return {
        success: false,
        err: `Not enough shares: got ${shares.length}, need ${threshold}`,
      };
    }

    const keyPackages: KeyPackageRaw[] = shares.map((s) => {
      const verifyingShare = computeVerifyingShare(s.share.signing_share);

      return {
        identifier: [...s.share.identifier.toUint8Array()],
        signing_share: [...s.share.signing_share.toUint8Array()],
        verifying_share: [...verifyingShare.toUint8Array()],
        verifying_key: [...verifyingKey.toUint8Array()],
        min_signers: threshold,
      };
    });

    const combined: number[] = wasmModule.sss_combine(keyPackages);

    const result = Bytes.fromUint8Array(Uint8Array.from(combined), 32);
    if (!result.success) {
      return { success: false, err: result.err };
    }

    return { success: true, data: result.data };
  } catch (e) {
    return { success: false, err: `combineTeddsaShares failed: ${String(e)}` };
  }
}

/**
 * Reconstruct KeyPackage from recovered signing_share.
 *
 * Computes verifying_share from signing_share to create complete KeyPackage.
 *
 * @param signingShare - SSS-recovered client signing_share
 * @param frostIdentifier - FROST P0 identifier (client is always 1)
 * @param verifyingKey - PublicKeyPackage's verifying_key
 * @param minSigners - threshold (2 for 2-of-2)
 * @returns Complete FROST KeyPackage
 */
export function reconstructKeyPackage(
  signingShare: Bytes32,
  frostIdentifier: Bytes32,
  verifyingKey: Bytes32,
  minSigners: number,
): KeyPackage {
  const verifyingShare = computeVerifyingShare(signingShare);

  return {
    identifier: frostIdentifier,
    signing_share: signingShare,
    verifying_share: verifyingShare,
    verifying_key: verifyingKey,
    min_signers: minSigners,
  };
}

/**
 * Extract signing_share from KeyPackageRaw.
 */
export function extractSigningShare(
  keyPackage: KeyPackageRaw,
): Result<Bytes32, string> {
  const signingShareRes = Bytes.fromUint8Array(
    new Uint8Array(keyPackage.signing_share),
    32,
  );
  if (!signingShareRes.success) {
    return { success: false, err: signingShareRes.err };
  }
  return { success: true, data: signingShareRes.data };
}

/**
 * Extract signing_share from KeyPackage (Bytes type).
 */
export function extractSigningShareFromKeyPackage(
  keyPackage: KeyPackage,
): Bytes32 {
  return keyPackage.signing_share;
}

/**
 * Convert KeyPackage (Bytes type) to KeyPackageRaw (number[] type).
 */
export function keyPackageToRaw(keyPackage: KeyPackage): KeyPackageRaw {
  return {
    identifier: [...keyPackage.identifier.toUint8Array()],
    signing_share: [...keyPackage.signing_share.toUint8Array()],
    verifying_share: [...keyPackage.verifying_share.toUint8Array()],
    verifying_key: [...keyPackage.verifying_key.toUint8Array()],
    min_signers: keyPackage.min_signers,
  };
}

/**
 * Get client's FROST identifier for centralized 2-of-2 keygen.
 * In centralized keygen, client (participant 0) has identifier = scalar 1.
 * This is represented as little-endian 32-byte value.
 */
export function getClientFrostIdentifier(): Result<Bytes32, string> {
  // Scalar 1 in little-endian format
  const identifierBytes = new Uint8Array(32);
  identifierBytes[0] = 1;
  return Bytes.fromUint8Array(identifierBytes, 32);
}

/**
 * Get server's FROST identifier for centralized 2-of-2 keygen.
 * In centralized keygen, server (participant 1) has identifier = scalar 2.
 */
export function getServerFrostIdentifier(): Result<Bytes32, string> {
  // Scalar 2 in little-endian format
  const identifierBytes = new Uint8Array(32);
  identifierBytes[0] = 2;
  return Bytes.fromUint8Array(identifierBytes, 32);
}

/**
 * Result type for expandTeddsaSigningShare.
 */
export interface ExpandTeddsaSharesResult {
  reshared_shares: TeddsaKeyShareByNode[];
  original_signing_share: Bytes32;
}

/**
 * Expand existing ed25519 signing_share SSS shares for additional nodes.
 *
 * This function recovers the original signing_share from existing shares,
 * then re-splits it for all nodes (existing + additional).
 *
 * @param existingShares - TeddsaKeyShareByNode[] from ACTIVE nodes
 * @param additionalNodes - NodeNameAndEndpoint[] for NOT_REGISTERED/UNRECOVERABLE nodes
 * @param threshold - SSS threshold
 * @param verifyingKey - PublicKeyPackage's verifying_key
 * @returns TeddsaKeyShareByNode[] - shares for ALL nodes (existing + additional)
 */
export async function expandTeddsaSigningShare(
  existingShares: TeddsaKeyShareByNode[],
  additionalNodes: NodeNameAndEndpoint[],
  threshold: number,
  verifyingKey: Bytes32,
): Promise<Result<ExpandTeddsaSharesResult, string>> {
  try {
    // 1. Recover signing_share from existing shares
    const signingShareRes = await combineTeddsaShares(
      existingShares,
      threshold,
      verifyingKey,
    );
    if (!signingShareRes.success) {
      return { success: false, err: signingShareRes.err };
    }

    // 2. Build full node list (existing + additional)
    const allNodes: NodeNameAndEndpoint[] = [
      ...existingShares.map((s) => s.node),
      ...additionalNodes,
    ];

    // 3. Generate new identifiers for all nodes
    const identifiersRes = await hashKeyshareNodeNamesEd25519(
      allNodes.map((n) => n.name),
    );
    if (!identifiersRes.success) {
      return { success: false, err: identifiersRes.err };
    }

    // 4. SSS re-split for all nodes
    const identifiers = identifiersRes.data.map((b) => [...b.toUint8Array()]);
    const signingShareArr = [...signingShareRes.data.toUint8Array()];

    const splitOutput: SplitOutputRaw = wasmModule.sss_split(
      signingShareArr,
      identifiers,
      threshold,
    );

    // 5. Convert to TeddsaKeyShareByNode format
    const resharedShares: TeddsaKeyShareByNode[] = splitOutput.key_packages.map(
      (kp, i) => {
        const idBytes = Bytes.fromUint8Array(new Uint8Array(kp.identifier), 32);
        const shareBytes = Bytes.fromUint8Array(
          new Uint8Array(kp.signing_share),
          32,
        );

        if (!idBytes.success) throw new Error(idBytes.err);
        if (!shareBytes.success) throw new Error(shareBytes.err);

        return {
          node: allNodes[i],
          share: {
            identifier: idBytes.data,
            signing_share: shareBytes.data,
          },
        };
      },
    );

    return {
      success: true,
      data: {
        reshared_shares: resharedShares,
        original_signing_share: signingShareRes.data,
      },
    };
  } catch (e) {
    return {
      success: false,
      err: `expandTeddsaSigningShare failed: ${String(e)}`,
    };
  }
}
