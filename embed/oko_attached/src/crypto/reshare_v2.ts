import type { KeyShareNodeMetaWithNodeStatusInfo } from "@oko-wallet/oko-types/tss";
import type {
  NodeNameAndEndpoint,
  UserKeySharePointByNode,
  TeddsaKeyShareByNode,
} from "@oko-wallet/oko-types/user_key_share";
import {
  hexToTeddsaKeyShare,
  teddsaKeyShareToHex,
} from "@oko-wallet/oko-types/user_key_share";
import type { Result } from "@oko-wallet/stdlib-js";
import type { Bytes32, Bytes33 } from "@oko-wallet/bytes";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type { PublicKeyPackageRaw } from "@oko-wallet/oko-types/teddsa";
import type { ReshareRequestV2 } from "@oko-wallet/oko-types/user";

import {
  type KeySharesByNode,
  requestKeySharesV2,
  reshareKeySharesV2,
  reshareRegisterV2,
} from "@oko-wallet-attached/requests/ks_node_v2";
import {
  makeAuthorizedOkoApiRequest,
  TSS_V2_ENDPOINT,
} from "@oko-wallet-attached/requests/oko_api";

import {
  decodeKeyShareStringToPoint256,
  encodePoint256ToKeyShareString,
} from "./key_share_utils";
import { runExpandShares } from "./reshare";
import {
  expandTeddsaSigningShare,
  reconstructKeyPackage,
  keyPackageToRaw,
  getClientFrostIdentifier,
  getServerFrostIdentifier,
} from "./sss_ed25519";
import { computeVerifyingShare } from "./scalar";

/**
 * Convert V2 API response to secp256k1 UserKeySharePointByNode format.
 */
export function convertSecp256k1Shares(
  keySharesByNode: KeySharesByNode[],
): UserKeySharePointByNode[] {
  const result: UserKeySharePointByNode[] = [];
  for (const item of keySharesByNode) {
    const shareHex = item.shares.secp256k1;
    if (!shareHex) continue;

    const point256Res = decodeKeyShareStringToPoint256(shareHex);
    if (!point256Res.success) {
      throw new Error(`secp256k1 decode err: ${point256Res.err}`);
    }
    result.push({
      node: item.node,
      share: point256Res.data,
    });
  }
  return result;
}

/**
 * Convert V2 API response to ed25519 TeddsaKeyShareByNode format.
 */
export function convertEd25519Shares(
  keySharesByNode: KeySharesByNode[],
): TeddsaKeyShareByNode[] {
  const result: TeddsaKeyShareByNode[] = [];
  for (const item of keySharesByNode) {
    const shareHex = item.shares.ed25519;
    if (!shareHex) continue;

    const teddsaShare = hexToTeddsaKeyShare(shareHex);
    result.push({
      node: item.node,
      share: teddsaShare,
    });
  }
  return result;
}

export interface ReshareV2Result {
  keyshare1Secp256k1: string; // hex string
  keyPackageEd25519: string; // hex-encoded KeyPackageRaw JSON
  publicKeyPackageEd25519: string; // hex-encoded PublicKeyPackageRaw JSON
}

/**
 * Reshare user key shares for both secp256k1 and ed25519.
 *
 * This function handles the full reshare flow:
 * 1. Classify nodes by status (ACTIVE vs NOT_REGISTERED/UNRECOVERABLE)
 * 2. Request existing shares from ACTIVE nodes
 * 3. Expand shares for all nodes (secp256k1 + ed25519)
 * 4. Send new shares to KSN (reshare for ACTIVE, reshare/register for new)
 * 5. Update Oko API
 * 6. Return client's keyshare1 and KeyPackage
 */
export async function reshareUserKeySharesV2(
  publicKeySecp256k1: Bytes33,
  publicKeyEd25519: Bytes32,
  idToken: string,
  keyshareNodeMetaSecp256k1: KeyShareNodeMetaWithNodeStatusInfo,
  keyshareNodeMetaEd25519: KeyShareNodeMetaWithNodeStatusInfo,
  authType: AuthType,
  serverVerifyingShare: Bytes32,
): Promise<Result<ReshareV2Result, string>> {
  // 1. Classify nodes by status
  const activeNodes = keyshareNodeMetaSecp256k1.nodes.filter(
    (n) => n.wallet_status === "ACTIVE",
  );
  const additionalNodes = keyshareNodeMetaSecp256k1.nodes.filter(
    (n) =>
      n.wallet_status === "NOT_REGISTERED" ||
      n.wallet_status === "UNRECOVERABLE_DATA_LOSS",
  );

  if (activeNodes.length < keyshareNodeMetaSecp256k1.threshold) {
    return {
      success: false,
      err: "insufficient existing KS nodes for reshare",
    };
  }

  // 2. Request existing shares from ACTIVE nodes
  const requestSharesRes = await requestKeySharesV2(
    idToken,
    activeNodes,
    keyshareNodeMetaSecp256k1.threshold,
    authType,
    {
      secp256k1: publicKeySecp256k1.toHex(),
      ed25519: publicKeyEd25519.toHex(),
    },
  );
  if (!requestSharesRes.success) {
    return {
      success: false,
      err: `Failed to request shares: ${requestSharesRes.err.code}`,
    };
  }

  // 3-a. secp256k1 expand
  const secp256k1SharesByNode = convertSecp256k1Shares(requestSharesRes.data);
  const secp256k1ExpandRes = await runExpandShares(
    secp256k1SharesByNode,
    additionalNodes,
    keyshareNodeMetaSecp256k1.threshold,
  );
  if (!secp256k1ExpandRes.success) {
    return { success: false, err: secp256k1ExpandRes.err };
  }

  // 3-b. ed25519 expand
  const ed25519SharesByNode = convertEd25519Shares(requestSharesRes.data);
  const ed25519ExpandRes = await expandTeddsaSigningShare(
    ed25519SharesByNode,
    additionalNodes,
    keyshareNodeMetaEd25519.threshold,
    publicKeyEd25519,
  );
  if (!ed25519ExpandRes.success) {
    return { success: false, err: ed25519ExpandRes.err };
  }

  // 4. Send new shares to KSN
  const allResharedNodes =
    secp256k1ExpandRes.data.reshared_user_key_shares.map((s) => s.node);

  const sendResults = await Promise.all(
    secp256k1ExpandRes.data.reshared_user_key_shares.map(
      async (secp256k1Share, index) => {
        const ed25519Share = ed25519ExpandRes.data.reshared_shares[index];
        const node = secp256k1Share.node;

        // Determine node status for API routing
        const nodeStatus = keyshareNodeMetaSecp256k1.nodes.find(
          (n) => n.endpoint === node.endpoint,
        )?.wallet_status;

        const isNewNode =
          nodeStatus === "NOT_REGISTERED" ||
          nodeStatus === "UNRECOVERABLE_DATA_LOSS";

        const wallets = {
          secp256k1: {
            public_key: publicKeySecp256k1.toHex(),
            share: encodePoint256ToKeyShareString(secp256k1Share.share),
          },
          ed25519: {
            public_key: publicKeyEd25519.toHex(),
            share: teddsaKeyShareToHex(ed25519Share.share),
          },
        };

        if (isNewNode) {
          return reshareRegisterV2(node.endpoint, idToken, authType, wallets);
        } else {
          return reshareKeySharesV2(node.endpoint, idToken, authType, wallets);
        }
      },
    ),
  );

  const errResults = sendResults.filter((r) => !r.success);
  if (errResults.length > 0) {
    return {
      success: false,
      err: errResults.map((r) => (r as { err: string }).err).join("\n"),
    };
  }

  // 5. Update Oko API
  const updateRes = await makeAuthorizedOkoApiRequest<ReshareRequestV2, void>(
    "user/reshare",
    idToken,
    {
      wallets: {
        secp256k1: publicKeySecp256k1.toHex(),
        ed25519: publicKeyEd25519.toHex(),
      },
      reshared_key_shares: allResharedNodes,
    },
    TSS_V2_ENDPOINT,
  );
  if (!updateRes.success) {
    return { success: false, err: "Failed to update wallet status for reshare" };
  }

  // 6. Build result
  const clientIdentifierRes = getClientFrostIdentifier();
  if (!clientIdentifierRes.success) {
    return { success: false, err: clientIdentifierRes.err };
  }

  const serverIdentifierRes = getServerFrostIdentifier();
  if (!serverIdentifierRes.success) {
    return { success: false, err: serverIdentifierRes.err };
  }

  const keyPackage = reconstructKeyPackage(
    ed25519ExpandRes.data.original_signing_share,
    clientIdentifierRes.data,
    publicKeyEd25519,
    keyshareNodeMetaEd25519.threshold,
  );

  // Build PublicKeyPackageRaw
  const clientVerifyingShare = computeVerifyingShare(
    ed25519ExpandRes.data.original_signing_share,
  );
  const publicKeyPackageRaw: PublicKeyPackageRaw = {
    verifying_shares: [
      {
        identifier: clientIdentifierRes.data.toHex(),
        share: [...clientVerifyingShare.toUint8Array()],
      },
      {
        identifier: serverIdentifierRes.data.toHex(),
        share: [...serverVerifyingShare.toUint8Array()],
      },
    ],
    verifying_key: [...publicKeyEd25519.toUint8Array()],
  };

  return {
    success: true,
    data: {
      keyshare1Secp256k1: secp256k1ExpandRes.data.original_secret.toHex(),
      keyPackageEd25519: Buffer.from(
        JSON.stringify(keyPackageToRaw(keyPackage)),
      ).toString("hex"),
      publicKeyPackageEd25519: Buffer.from(
        JSON.stringify(publicKeyPackageRaw),
      ).toString("hex"),
    },
  };
}
