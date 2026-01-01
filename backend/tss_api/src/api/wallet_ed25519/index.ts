import { Pool } from "pg";
import { decryptDataAsync } from "@oko-wallet/crypto-js/node";
import { getActiveWalletByUserIdAndCurveType } from "@oko-wallet/oko-pg-interface/ewallet_wallets";
import { getUserByEmailAndAuthType } from "@oko-wallet/oko-pg-interface/ewallet_users";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import {
  Participant,
  participantToIdentifier,
} from "@oko-wallet/teddsa-interface";

export interface WalletEd25519PublicInfoRequest {
  email: string;
  auth_type: AuthType;
}

export interface WalletEd25519PublicInfoResponse {
  public_key: string; // hex string
  public_key_package: number[];
  identifier: number[];
}

/**
 * Get Ed25519 wallet public info (for key recovery).
 * Returns public_key_package and identifier needed to reconstruct
 * the key_package from KS node shares.
 */
export async function getWalletEd25519PublicInfo(
  db: Pool,
  encryptionSecret: string,
  request: WalletEd25519PublicInfoRequest,
): Promise<OkoApiResponse<WalletEd25519PublicInfoResponse>> {
  try {
    const { email, auth_type } = request;

    // Get user
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
        msg: "User not found",
      };
    }
    const user = getUserRes.data;

    // Get Ed25519 wallet
    const getWalletRes = await getActiveWalletByUserIdAndCurveType(
      db,
      user.user_id,
      "ed25519",
    );
    if (getWalletRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getActiveWalletByUserIdAndCurveType error: ${getWalletRes.err}`,
      };
    }
    if (getWalletRes.data === null) {
      return {
        success: false,
        code: "WALLET_NOT_FOUND",
        msg: "Ed25519 wallet not found",
      };
    }
    const wallet = getWalletRes.data;

    // Decrypt the stored key package data
    const encryptedShare = wallet.enc_tss_share.toString("utf-8");
    const decryptedShare = await decryptDataAsync(
      encryptedShare,
      encryptionSecret,
    );
    const keyPackageData = JSON.parse(decryptedShare) as {
      key_package: number[];
      public_key_package: number[];
      identifier: number[];
    };

    // Return public info for client key recovery
    // Server stores keygen_2 (P1), but client needs identifier for P0
    return {
      success: true,
      data: {
        public_key: wallet.public_key.toString("hex"),
        public_key_package: keyPackageData.public_key_package,
        identifier: participantToIdentifier(Participant.P0),
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `getWalletEd25519PublicInfo error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
