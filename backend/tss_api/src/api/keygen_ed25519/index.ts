import { Pool } from "pg";
import {
  createUser,
  getUserByEmailAndAuthType,
} from "@oko-wallet/oko-pg-interface/oko_users";
import { encryptDataAsync } from "@oko-wallet/crypto-js/node";
import { Bytes } from "@oko-wallet/bytes";
import { type WalletStatus, type Wallet } from "@oko-wallet/oko-types/wallets";
import type { KeygenEd25519Request } from "@oko-wallet/oko-types/tss";
import type { SignInResponse, User } from "@oko-wallet/oko-types/user";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import {
  createWallet,
  getActiveWalletByUserIdAndCurveType,
  getWalletByPublicKey,
} from "@oko-wallet/oko-pg-interface/oko_wallets";
import {
  createWalletKSNodes,
  getActiveKSNodes,
} from "@oko-wallet/oko-pg-interface/ks_nodes";
import { getKeyShareNodeMeta } from "@oko-wallet/oko-pg-interface/key_share_node_meta";

import { generateUserToken } from "@oko-wallet-tss-api/api/keplr_auth";

export async function runKeygenEd25519(
  db: Pool,
  jwtConfig: {
    secret: string;
    expires_in: string;
  },
  keygenRequest: KeygenEd25519Request,
  encryptionSecret: string,
): Promise<OkoApiResponse<SignInResponse>> {
  try {
    const { auth_type, email, keygen_2, name } = keygenRequest;

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
        "ed25519",
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
          msg: `Ed25519 wallet already exists: ${getActiveWalletRes.data.public_key.toString("hex")}`,
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

    const publicKeyUint8 = new Uint8Array(keygen_2.public_key);
    const publicKeyHex = Buffer.from(publicKeyUint8).toString("hex");

    const publicKeyRes = Bytes.fromUint8Array(publicKeyUint8, 32);
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
        msg: `Duplicate public key: ${publicKeyHex}`,
      };
    }

    // Ed25519 uses 2-of-2 threshold signature with server, not SSS key share nodes
    // Skip checkKeyShareFromKSNodes validation (which expects secp256k1 33-byte keys)
    const getActiveKSNodesRes = await getActiveKSNodes(db);
    if (getActiveKSNodesRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getActiveKSNodes error: ${getActiveKSNodesRes.err}`,
      };
    }
    const activeKSNodes = getActiveKSNodesRes.data;
    const ksNodeIds: string[] = activeKSNodes.map((node) => node.node_id);

    const keyPackageJson = JSON.stringify({
      key_package: keygen_2.key_package,
      public_key_package: keygen_2.public_key_package,
      identifier: keygen_2.identifier,
    });

    const encryptedShare = await encryptDataAsync(
      keyPackageJson,
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
        curve_type: "ed25519",
        public_key: Buffer.from(publicKeyBytes.toUint8Array()),
        enc_tss_share: encryptedShareBuffer,
        sss_threshold: globalSSSThreshold,
        status: "ACTIVE" as WalletStatus,
      });
      if (createWalletRes.success === false) {
        throw new Error(`createWallet error: ${createWalletRes.err}`);
      }
      wallet = createWalletRes.data;

      if (ksNodeIds.length > 0) {
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

    // Look up secp256k1 wallet if exists (for existing users)
    const secp256k1WalletRes = await getActiveWalletByUserIdAndCurveType(
      db,
      user.user_id,
      "secp256k1",
    );
    const secp256k1WalletId =
      secp256k1WalletRes.success && secp256k1WalletRes.data
        ? secp256k1WalletRes.data.wallet_id
        : wallet.wallet_id; // Fallback to ed25519 wallet_id if no secp256k1

    const tokenResult = generateUserToken({
      wallet_id: secp256k1WalletId,
      wallet_id_ed25519: wallet.wallet_id,
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
          public_key: publicKeyHex,
          name: name ?? null,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `runKeygenEd25519 error: ${error}`,
    };
  }
}
