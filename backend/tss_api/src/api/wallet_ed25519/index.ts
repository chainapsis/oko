import { Pool } from "pg";
import { decryptDataAsync } from "@oko-wallet/crypto-js/node";
import { getActiveWalletByUserIdAndCurveType } from "@oko-wallet/oko-pg-interface/oko_wallets";
import { getUserByEmailAndAuthType } from "@oko-wallet/oko-pg-interface/oko_users";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import {
  Participant,
  participantToIdentifier,
} from "@oko-wallet/teddsa-interface";
import { reconstructPublicKeyPackageEd25519 } from "@oko-wallet/teddsa-addon/src/server";

export interface WalletEd25519PublicInfoRequest {
  user_identifier: string;
  auth_type: AuthType;
  user_verifying_share: number[]; // P0's verifying_share (32 bytes)
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
    const { user_identifier, auth_type, user_verifying_share } = request;

    // Get user
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

    // Decrypt stored shares
    const encryptedShare = wallet.enc_tss_share.toString("utf-8");
    const decryptedShare = await decryptDataAsync(
      encryptedShare,
      encryptionSecret,
    );
    const storedShares = JSON.parse(decryptedShare) as {
      signing_share: number[];
      verifying_share: number[];
    };

    // Reconstruct public_key_package from user and server verifying_shares
    const userIdentifier = participantToIdentifier(Participant.P0);
    const serverIdentifier = participantToIdentifier(Participant.P1);
    const verifyingKey = Array.from(wallet.public_key);

    let publicKeyPackageBytes: Uint8Array;
    try {
      publicKeyPackageBytes = reconstructPublicKeyPackageEd25519(
        new Uint8Array(user_verifying_share),
        new Uint8Array(userIdentifier),
        new Uint8Array(storedShares.verifying_share),
        new Uint8Array(serverIdentifier),
        new Uint8Array(verifyingKey),
      );
    } catch (error) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to reconstruct public_key_package: ${error instanceof Error ? error.message : String(error)}`,
      };
    }

    return {
      success: true,
      data: {
        public_key: wallet.public_key.toString("hex"),
        public_key_package: Array.from(publicKeyPackageBytes),
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
