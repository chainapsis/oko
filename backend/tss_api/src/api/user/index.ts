import { Pool } from "pg";
import {
  getActiveWalletByUserIdAndCurveType,
  getWalletByPublicKey,
} from "@oko-wallet/oko-pg-interface/ewallet_wallets";
import type {
  CheckEmailResponse,
  ReshareReason,
  SignInResponse,
  User,
} from "@oko-wallet/oko-types/user";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { getUserByEmailAndAuthType } from "@oko-wallet/oko-pg-interface/ewallet_users";
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
import type { Wallet } from "@oko-wallet-types/wallets";
import type { NodeNameAndEndpoint } from "@oko-wallet-types/user_key_share";
import type { Bytes33 } from "@oko-wallet/bytes";

import { generateUserToken } from "@oko-wallet-tss-api/api/keplr_auth";
import { checkKeyShareFromKSNodes } from "@oko-wallet-tss-api/api/ks_node";

export async function signIn(
  db: Pool,
  email: string,
  auth_type: AuthType,
  jwt_config: {
    secret: string;
    expires_in: string;
  },
): Promise<OkoApiResponse<SignInResponse>> {
  try {
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

    const walletRes = await getActiveWalletByUserIdAndCurveType(
      db,
      getUserRes.data.user_id,
      "secp256k1",
    );
    if (walletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getActiveWalletByUserIdAndCurveType error: ${walletRes.err}`,
      };
    }
    if (walletRes.data === null) {
      return {
        success: false,
        code: "WALLET_NOT_FOUND",
        msg: `Wallet not found: ${email}`,
      };
    }

    const tokenResult = generateUserToken({
      wallet_id: walletRes.data.wallet_id,
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
          email: getUserRes.data.email,
          wallet_id: walletRes.data.wallet_id,
          public_key: walletRes.data.public_key.toString("hex"),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `signIn error: ${error instanceof Error ? error.message : String(error)}`,
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

export async function updateWalletKSNodesForReshare(
  db: Pool,
  email: string,
  auth_type: AuthType,
  public_key: Bytes33,
  reshared_key_shares: NodeNameAndEndpoint[],
): Promise<OkoApiResponse<void>> {
  try {
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

    const walletRes = await getWalletByPublicKey(
      db,
      Buffer.from(public_key.toUint8Array()),
    );
    if (walletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getActiveWalletByUserIdAndCurveType error: ${walletRes.err}`,
      };
    }
    if (walletRes.data === null) {
      return {
        success: false,
        code: "WALLET_NOT_FOUND",
        msg: `Wallet not found: ${email}`,
      };
    }

    const wallet: Wallet = walletRes.data;
    if (wallet.status !== "ACTIVE") {
      return {
        success: false,
        code: "FORBIDDEN",
        msg: `Wallet is not active: ${wallet.public_key.toString("hex")}`,
      };
    }

    if (wallet.user_id !== user.user_id) {
      return {
        success: false,
        code: "FORBIDDEN",
        msg: `wallet user_id mismatch: ${email}`,
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

    const checkKeyshareFromKSNodesRes = await checkKeyShareFromKSNodes(
      email,
      public_key,
      getKSNodesRes.data,
      auth_type,
    );
    if (checkKeyshareFromKSNodesRes.success === false) {
      return checkKeyshareFromKSNodesRes;
    }

    const nodeIds = checkKeyshareFromKSNodesRes.data.nodeIds;
    const upsertWalletKSNodesRes = await upsertWalletKSNodes(
      db,
      wallet.wallet_id,
      nodeIds,
    );
    if (upsertWalletKSNodesRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `upsertWalletKSNodes error: ${upsertWalletKSNodesRes.err}`,
      };
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
