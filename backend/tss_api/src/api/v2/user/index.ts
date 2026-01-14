import { Pool } from "pg";
import {
  getActiveWalletByUserIdAndCurveType,
  getWalletByPublicKey,
} from "@oko-wallet/oko-pg-interface/oko_wallets";
import type {
  CheckEmailResponse,
  ReshareReason,
  SignInResponseV2,
  User,
} from "@oko-wallet/oko-types/user";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { getUserByEmailAndAuthType } from "@oko-wallet/oko-pg-interface/oko_users";
import {
  getActiveKSNodes,
  getWalletKSNodesByWalletId,
  getKSNodesByServerUrl,
  upsertWalletKSNodes,
} from "@oko-wallet/oko-pg-interface/ks_nodes";
import type {
  WalletKSNodeWithNodeNameAndServerUrl,
  WalletKSNodeStatus,
} from "@oko-wallet/oko-types/tss";
import { getKeyShareNodeMeta } from "@oko-wallet/oko-pg-interface/key_share_node_meta";
import type { Wallet } from "@oko-wallet/oko-types/wallets";
import type { NodeNameAndEndpoint } from "@oko-wallet/oko-types/user_key_share";
import type { Bytes32, Bytes33 } from "@oko-wallet/bytes";

import { generateUserTokenV2 } from "@oko-wallet-tss-api/api/keplr_auth";
import { checkKeyShareFromKSNodesV2 } from "@oko-wallet-tss-api/api/ks_node";

export async function signInV2(
  db: Pool,
  user_identifier: string,
  auth_type: AuthType,
  jwt_config: {
    secret: string;
    expires_in: string;
  },
  email?: string,
  name?: string,
): Promise<OkoApiResponse<SignInResponseV2>> {
  try {
    const getUserRes = await getUserByEmailAndAuthType(
      db,
      user_identifier,
      auth_type,
    );
    if (getUserRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getUserByEmailAndAuthType error: ${getUserRes.err}`,
      };
    }
    if (getUserRes.data === null) {
      return {
        success: false,
        code: "USER_NOT_FOUND",
        msg: `User not found: ${user_identifier} (auth_type: ${auth_type})`,
      };
    }

    const secp256k1WalletRes = await getActiveWalletByUserIdAndCurveType(
      db,
      getUserRes.data.user_id,
      "secp256k1",
    );
    if (secp256k1WalletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getActiveWalletByUserIdAndCurveType (secp256k1) error: ${secp256k1WalletRes.err}`,
      };
    }

    const ed25519WalletRes = await getActiveWalletByUserIdAndCurveType(
      db,
      getUserRes.data.user_id,
      "ed25519",
    );
    if (ed25519WalletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getActiveWalletByUserIdAndCurveType (ed25519) error: ${ed25519WalletRes.err}`,
      };
    }

    if (secp256k1WalletRes.data === null || ed25519WalletRes.data === null) {
      return {
        success: false,
        code: "WALLET_NOT_FOUND",
        msg: `Wallet not found`,
      };
    }

    const secp256k1Wallet = secp256k1WalletRes.data;
    const ed25519Wallet = ed25519WalletRes.data;

    const tokenResult = generateUserTokenV2({
      wallet_id_secp256k1: secp256k1Wallet.wallet_id,
      wallet_id_ed25519: ed25519Wallet.wallet_id,
      email: getUserRes.data.email,
      jwt_config,
    });

    if (tokenResult.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `generateUserToken error: ${tokenResult.err}`,
      };
    }

    return {
      success: true,
      data: {
        token: tokenResult.data.token,
        user: {
          wallet_id_secp256k1: secp256k1Wallet.wallet_id,
          wallet_id_ed25519: ed25519Wallet.wallet_id,
          public_key_secp256k1: secp256k1Wallet.public_key.toString("hex"),
          public_key_ed25519: ed25519Wallet.public_key.toString("hex"),
          user_identifier: user_identifier,
          email: email ?? null,
          name: name ?? null,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `signInV2 error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function checkEmail(
  db: Pool,
  email: string,
  auth_type: AuthType,
): Promise<OkoApiResponse<CheckEmailResponse>> {
  try {
    // Check if user exists and has an active wallet
    const getUserRes = await getUserByEmailAndAuthType(db, email, auth_type);
    if (getUserRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getUserByEmailAndAuthType error: ${getUserRes.err}`,
      };
    }
    const user = getUserRes.data;

    let wallet: Wallet | null = null;
    if (user !== null) {
      const walletRes = await getActiveWalletByUserIdAndCurveType(
        db,
        user.user_id,
        "secp256k1",
      );
      if (walletRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `getActiveWalletByUserIdAndCurveType error: ${walletRes.err}`,
        };
      }
      wallet = walletRes.data;
    }

    const getActiveKSNodesRes = await getActiveKSNodes(db);
    if (getActiveKSNodesRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getActiveKSNodes error: ${getActiveKSNodesRes.err}`,
      };
    }
    const activeKSNodes = getActiveKSNodesRes.data;

    // Signup flow: user doesn't exist or no active wallet
    if (user === null || wallet === null) {
      const getKeyshareNodeMetaRes = await getKeyShareNodeMeta(db);
      if (getKeyshareNodeMetaRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `getKeyShareNodeMeta error: ${getKeyshareNodeMetaRes.err}`,
        };
      }
      const threshold = getKeyshareNodeMetaRes.data.sss_threshold;

      return {
        success: true,
        data: {
          exists: false,
          keyshare_node_meta: {
            threshold,
            nodes: activeKSNodes.map((ksNode) => ({
              name: ksNode.node_name,
              endpoint: ksNode.server_url,
              wallet_status: "NOT_REGISTERED",
            })),
          },
          needs_reshare: false,
          active_nodes_below_threshold: activeKSNodes.length < threshold,
        },
      };
    }

    // User has active wallet -> fetch wallet KS nodes
    const getAllWalletKSNodesRes = await getWalletKSNodesByWalletId(
      db,
      wallet.wallet_id,
    );
    if (getAllWalletKSNodesRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getWalletKSNodesByWalletId error: ${getAllWalletKSNodesRes.err}`,
      };
    }

    const activeKSNodeIds = new Set(activeKSNodes.map((n) => n.node_id));
    const walletNodeIds = new Set<string>();
    const walletKSNodeStatusMap = new Map<string, WalletKSNodeStatus>();
    const activeWalletKSNodes: WalletKSNodeWithNodeNameAndServerUrl[] = [];
    let unrecoverableExists = false;
    const newNodeIds: string[] = [];

    for (const node of getAllWalletKSNodesRes.data) {
      walletNodeIds.add(node.node_id);
      walletKSNodeStatusMap.set(node.node_id, node.status);

      if (node.status === "ACTIVE" && activeKSNodeIds.has(node.node_id)) {
        activeWalletKSNodes.push(node);
      }

      if (node.status === "UNRECOVERABLE_DATA_LOSS") {
        unrecoverableExists = true;
      }
    }

    // Find new nodes (active nodes not in wallet)
    for (const node of activeKSNodes) {
      if (!walletNodeIds.has(node.node_id)) {
        newNodeIds.push(node.node_id);
      }
    }

    // Calculate reshare requirements
    const reshare_reasons: ReshareReason[] = [];
    if (unrecoverableExists) {
      reshare_reasons.push("UNRECOVERABLE_NODE_DATA_LOSS");
    }
    if (newNodeIds.length > 0) {
      reshare_reasons.push("NEW_NODE_ADDED");
    }

    const needsReshare = reshare_reasons.length > 0;
    const activeNodesBelowThreshold =
      activeWalletKSNodes.length < wallet.sss_threshold;

    return {
      success: true,
      data: {
        exists: true,
        keyshare_node_meta: {
          threshold: wallet.sss_threshold,
          nodes: activeKSNodes.map((ksNode) => ({
            name: ksNode.node_name,
            endpoint: ksNode.server_url,
            wallet_status: needsReshare
              ? (walletKSNodeStatusMap.get(ksNode.node_id) ?? "NOT_REGISTERED")
              : "ACTIVE",
          })),
        },
        needs_reshare: needsReshare,
        reshare_reasons: needsReshare ? reshare_reasons : undefined,
        active_nodes_below_threshold: activeNodesBelowThreshold,
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `checkEmail error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function updateWalletKSNodesForReshareV2(
  db: Pool,
  email: string,
  auth_type: AuthType,
  wallets: {
    secp256k1?: Bytes33;
    ed25519?: Bytes32;
  },
  reshared_key_shares: NodeNameAndEndpoint[],
): Promise<OkoApiResponse<void>> {
  try {
    if (!wallets.secp256k1 && !wallets.ed25519) {
      return {
        success: false,
        code: "INVALID_REQUEST",
        msg: "At least one wallet (secp256k1 or ed25519) must be provided",
      };
    }

    const getUserRes = await getUserByEmailAndAuthType(db, email, auth_type);
    if (getUserRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getUserByEmailAndAuthType error: ${getUserRes.err}`,
      };
    }
    if (getUserRes.data === null) {
      return {
        success: false,
        code: "USER_NOT_FOUND",
        msg: `User not found: ${email} (auth_type: ${auth_type})`,
      };
    }

    const user: User = getUserRes.data;
    if (user.status !== "ACTIVE") {
      return {
        success: false,
        code: "FORBIDDEN",
        msg: `User is not active: ${email}`,
      };
    }

    const serverUrls = Array.from(
      new Set(reshared_key_shares.map((n) => n.endpoint)),
    );
    const getKSNodesRes = await getKSNodesByServerUrl(db, serverUrls);
    if (getKSNodesRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getKSNodesByServerUrl error: ${getKSNodesRes.err}`,
      };
    }
    if (getKSNodesRes.data.length !== serverUrls.length) {
      return {
        success: false,
        code: "KS_NODE_NOT_FOUND",
        msg: "unknown server_urls detected",
      };
    }

    const checkKeyshareFromKSNodesRes = await checkKeyShareFromKSNodesV2(
      email,
      wallets,
      getKSNodesRes.data,
      auth_type,
    );
    if (checkKeyshareFromKSNodesRes.success === false) {
      return checkKeyshareFromKSNodesRes;
    }

    // Update wallet KS nodes for each wallet type
    if (wallets.secp256k1 && checkKeyshareFromKSNodesRes.data.secp256k1) {
      const walletRes = await getWalletByPublicKey(
        db,
        Buffer.from(wallets.secp256k1.toUint8Array()),
      );
      if (walletRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `getWalletByPublicKey (secp256k1) error: ${walletRes.err}`,
        };
      }
      if (walletRes.data === null) {
        return {
          success: false,
          code: "WALLET_NOT_FOUND",
          msg: `Secp256k1 wallet not found: ${email}`,
        };
      }

      const wallet: Wallet = walletRes.data;
      if (wallet.status !== "ACTIVE") {
        return {
          success: false,
          code: "FORBIDDEN",
          msg: `Secp256k1 wallet is not active: ${wallet.public_key.toString("hex")}`,
        };
      }

      if (wallet.user_id !== user.user_id) {
        return {
          success: false,
          code: "FORBIDDEN",
          msg: `Secp256k1 wallet user_id mismatch: ${email}`,
        };
      }

      if (wallet.curve_type !== "secp256k1") {
        return {
          success: false,
          code: "FORBIDDEN",
          msg: `Wallet curve type mismatch: expected secp256k1, got ${wallet.curve_type}`,
        };
      }

      const nodeIds = checkKeyshareFromKSNodesRes.data.secp256k1.nodeIds;
      const upsertWalletKSNodesRes = await upsertWalletKSNodes(
        db,
        wallet.wallet_id,
        nodeIds,
      );
      if (upsertWalletKSNodesRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `upsertWalletKSNodes (secp256k1) error: ${upsertWalletKSNodesRes.err}`,
        };
      }
    }

    if (wallets.ed25519 && checkKeyshareFromKSNodesRes.data.ed25519) {
      const walletRes = await getWalletByPublicKey(
        db,
        Buffer.from(wallets.ed25519.toUint8Array()),
      );
      if (walletRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `getWalletByPublicKey (ed25519) error: ${walletRes.err}`,
        };
      }
      if (walletRes.data === null) {
        return {
          success: false,
          code: "WALLET_NOT_FOUND",
          msg: `Ed25519 wallet not found: ${email}`,
        };
      }

      const wallet: Wallet = walletRes.data;
      if (wallet.status !== "ACTIVE") {
        return {
          success: false,
          code: "FORBIDDEN",
          msg: `Ed25519 wallet is not active: ${wallet.public_key.toString("hex")}`,
        };
      }

      if (wallet.user_id !== user.user_id) {
        return {
          success: false,
          code: "FORBIDDEN",
          msg: `Ed25519 wallet user_id mismatch: ${email}`,
        };
      }

      if (wallet.curve_type !== "ed25519") {
        return {
          success: false,
          code: "FORBIDDEN",
          msg: `Wallet curve type mismatch: expected ed25519, got ${wallet.curve_type}`,
        };
      }

      const nodeIds = checkKeyshareFromKSNodesRes.data.ed25519.nodeIds;
      const upsertWalletKSNodesRes = await upsertWalletKSNodes(
        db,
        wallet.wallet_id,
        nodeIds,
      );
      if (upsertWalletKSNodesRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `upsertWalletKSNodes (ed25519) error: ${upsertWalletKSNodesRes.err}`,
        };
      }
    }

    return {
      success: true,
      data: void 0,
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `updateWalletKSNodesForReshare error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
