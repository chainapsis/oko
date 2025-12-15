import { Pool } from "pg";
import {
  createUser,
  getUserByEmailAndAuthType,
} from "@oko-wallet/oko-pg-interface/ewallet_users";
import type { Result } from "@oko-wallet/stdlib-js";
import { encryptDataAsync } from "@oko-wallet/crypto-js/node";
import { Bytes, type Bytes33 } from "@oko-wallet/bytes";
import { type WalletStatus, type Wallet } from "@oko-wallet/oko-types/wallets";
import type { KeygenRequest } from "@oko-wallet/oko-types/tss";
import type { SignInResponse, User } from "@oko-wallet/oko-types/user";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import {
  createWallet,
  getActiveWalletByUserIdAndCurveType,
  getWalletByPublicKey,
} from "@oko-wallet/oko-pg-interface/ewallet_wallets";
import {
  createWalletKSNodes,
  getActiveKSNodes,
} from "@oko-wallet/oko-pg-interface/ks_nodes";
import { getKeyShareNodeMeta } from "@oko-wallet/oko-pg-interface/key_share_node_meta";

import { generateUserToken } from "@oko-wallet-tss-api/api/keplr_auth";
import { checkKeyShareFromKSNodes } from "@oko-wallet-tss-api/api/ks_node";

export async function runKeygen(
  db: Pool,
  jwtConfig: {
    secret: string;
    expires_in: string;
  },
  keygenRequest: KeygenRequest,
  auth_type: AuthType,
  encryptionSecret: string,
): Promise<OkoApiResponse<SignInResponse>> {
  try {
    const { email, keygen_2 } = keygenRequest;

    const getUserRes = await getUserByEmailAndAuthType(db, email, auth_type);
    if (getUserRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getUserByEmailAndAuthType error: ${getUserRes.err}`,
      };
    }

    let user: User;
    if (getUserRes.data !== null) {
      user = getUserRes.data;

      const getActiveWalletRes = await getActiveWalletByUserIdAndCurveType(
        db,
        user.user_id,
        "secp256k1",
      );
      if (getActiveWalletRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `getActiveWalletByUserIdAndCurveType error: ${getActiveWalletRes.err}`,
        };
      }
      if (getActiveWalletRes.data !== null) {
        return {
          success: false,
          code: "WALLET_ALREADY_EXISTS",
          msg: `Wallet already exists: ${getActiveWalletRes.data.public_key.toString("hex")}`,
        };
      }
    } else {
      const createUserRes = await createUser(db, email, auth_type);
      if (createUserRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `createUser error: ${createUserRes.err}`,
        };
      }
      user = createUserRes.data;
    }

    const publicKeyRes: Result<Bytes33, string> = Bytes.fromHexString(
      keygen_2.public_key,
      33,
    );
    if (publicKeyRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `publicKeyRes error: ${publicKeyRes.err}`,
      };
    }
    const publicKeyBytes = publicKeyRes.data;

    const walletByPublicKeyRes = await getWalletByPublicKey(
      db,
      Buffer.from(publicKeyBytes.toUint8Array()),
    );
    if (walletByPublicKeyRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getWalletByPublicKey error: ${walletByPublicKeyRes.err}`,
      };
    }
    if (walletByPublicKeyRes.data !== null) {
      return {
        success: false,
        code: "DUPLICATE_PUBLIC_KEY",
        msg: `Duplicate public key: ${keygen_2.public_key}`,
      };
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

    const checkKeyshareFromKSNodesRes = await checkKeyShareFromKSNodes(
      email,
      publicKeyBytes,
      activeKSNodes,
      auth_type,
    );
    if (checkKeyshareFromKSNodesRes.success === false) {
      return checkKeyshareFromKSNodesRes;
    }

    const ksNodeIds: string[] = checkKeyshareFromKSNodesRes.data.nodeIds;
    if (ksNodeIds.length === 0) {
      return {
        success: false,
        code: "KEYSHARE_NODE_INSUFFICIENT",
        msg: `no active ks nodes`,
      };
    }

    const encryptedShare = await encryptDataAsync(
      keygen_2.private_share,
      encryptionSecret,
    );
    const encryptedShareBuffer = Buffer.from(encryptedShare, "utf-8");

    const getKeyshareNodeMetaRes = await getKeyShareNodeMeta(db);
    if (getKeyshareNodeMetaRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getKeyShareNodeMeta error: ${getKeyshareNodeMetaRes.err}`,
      };
    }
    const globalSSSThreshold = getKeyshareNodeMetaRes.data.sss_threshold;

    let wallet: Wallet;
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const createWalletRes = await createWallet(client, {
        user_id: user.user_id,
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKeyBytes.toUint8Array()),
        enc_tss_share: encryptedShareBuffer,
        sss_threshold: globalSSSThreshold,
        status: "ACTIVE" as WalletStatus,
      });
      if (createWalletRes.success === false) {
        throw new Error(`createWallet error: ${createWalletRes.err}`);
      }
      wallet = createWalletRes.data;

      const createWalletKSNodesRes = await createWalletKSNodes(
        client,
        wallet.wallet_id,
        ksNodeIds,
      );
      if (createWalletKSNodesRes.success === false) {
        throw new Error(
          `createWalletKSNodes error: ${createWalletKSNodesRes.err}`,
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: error instanceof Error ? error.message : String(error),
      };
    } finally {
      client.release();
    }

    const tokenResult = generateUserToken({
      wallet_id: wallet.wallet_id,
      email: email,
      jwt_config: jwtConfig,
    });

    if (!tokenResult.success) {
      return {
        success: false,
        code: "FAILED_TO_GENERATE_TOKEN",
        msg: `generateUserToken error: ${tokenResult.err}`,
      };
    }

    return {
      success: true,
      data: {
        token: tokenResult.data.token,
        user: {
          email: email,
          wallet_id: wallet.wallet_id,
          public_key: keygen_2.public_key,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `runKeygen error: ${error}`,
    };
  }
}
