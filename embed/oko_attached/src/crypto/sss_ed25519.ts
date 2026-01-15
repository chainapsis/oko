import { Bytes, type Bytes32 } from "@oko-wallet/bytes";
import { wasmModule } from "@oko-wallet/frost-ed25519-keplr-wasm";
import type {
  KeyPackageRaw,
  PublicKeyPackageRaw,
} from "@oko-wallet/oko-types/teddsa";
import type { KeyShareNodeMetaWithNodeStatusInfo } from "@oko-wallet/oko-types/tss";
import type { TeddsaKeyShareByNode } from "@oko-wallet/oko-types/user_key_share";
import type { Result } from "@oko-wallet/stdlib-js";
import type { KeyPackage } from "@oko-wallet/teddsa-interface";

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

        if (!idBytes.success) {
          throw new Error(idBytes.err);
        }
        if (!shareBytes.success) {
          throw new Error(shareBytes.err);
        }

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
