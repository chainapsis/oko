import { Pool } from "pg";
import {
  createUser,
  getUserByEmail,
} from "@oko-wallet/oko-pg-interface/ewallet_users";
import type { Result } from "@oko-wallet/stdlib-js";
import { encryptDataAsync } from "@oko-wallet/crypto-js/node";
import { Bytes, type Bytes32 } from "@oko-wallet/bytes";
import { type WalletStatus, type Wallet } from "@oko-wallet/oko-types/wallets";
import type { SignInResponse, User } from "@oko-wallet/oko-types/user";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import {
  createWallet,
  getActiveWalletByUserIdAndCurveType,
  getWalletByPublicKey,
} from "@oko-wallet/oko-pg-interface/ewallet_wallets";

import { generateUserToken } from "@oko-wallet-tss-api/api/keplr_auth";

/**
 * Request body for Ed25519 keygen
 */
export interface KeygenEd25519Request {
  email: string;
  keygen_2: {
    /** Serialized KeyPackage as hex string */
    key_package: string;
    /** Serialized PublicKeyPackage as hex string */
    public_key_package: string;
    /** Ed25519 public key (32 bytes) as hex string */
    public_key: string;
  };
}

/**
 * Request body type for route handler
 */
export interface KeygenEd25519Body {
  keygen_2: {
    key_package: string;
    public_key_package: string;
    public_key: string;
  };
}

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
    const { email, keygen_2 } = keygenRequest;

    const getUserRes = await getUserByEmail(db, email);
    if (getUserRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getUserByEmail error: ${getUserRes.err}`,
      };
    }

    let user: User;
    if (getUserRes.data !== null) {
      user = getUserRes.data;

      // Check if ed25519 wallet already exists for this user
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
      const createUserRes = await createUser(db, email);
      if (createUserRes.success === false) {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `createUser error: ${createUserRes.err}`,
        };
      }
      user = createUserRes.data;
    }

    // Ed25519 public key is 32 bytes
    const publicKeyRes: Result<Bytes32, string> = Bytes.fromHexString(
      keygen_2.public_key,
      32,
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

    // For ed25519, we use a simplified 2-of-2 flow:
    // - keygen_1 is stored locally in browser storage
    // - keygen_2 is stored on the backend (encrypted)
    // No key share nodes are used (unlike secp256k1)

    // Encrypt the key_package (contains private share)
    const encryptedShare = await encryptDataAsync(
      keygen_2.key_package,
      encryptionSecret,
    );
    const encryptedShareBuffer = Buffer.from(encryptedShare, "utf-8");

    // Create wallet (no key share nodes for ed25519)
    // sss_threshold is set to 2 for 2-of-2 scheme (keygen_1 local, keygen_2 backend)
    const createWalletRes = await createWallet(db, {
      user_id: user.user_id,
      curve_type: "ed25519",
      public_key: Buffer.from(publicKeyBytes.toUint8Array()),
      enc_tss_share: encryptedShareBuffer,
      sss_threshold: 2,
      status: "ACTIVE" as WalletStatus,
    });
    if (createWalletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `createWallet error: ${createWalletRes.err}`,
      };
    }
    const wallet = createWalletRes.data;

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
      msg: `runKeygenEd25519 error: ${error}`,
    };
  }
}
