import type { Pool, PoolClient } from "pg";
import {
  getKeyShareByWalletId,
  getWalletByPublicKey,
} from "@oko-wallet/ksn-pg-interface";
import type {
  CheckWalletResult,
  GetKeyShareV2ResponseWallet,
  PublicKeyBytes,
} from "@oko-wallet/ksn-interface/key_share";
import type { CurveType } from "@oko-wallet/ksn-interface/curve_type";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import { decryptDataAsync } from "@oko-wallet-ksn-server/encrypt";

export async function getWalletKeyShare(
  db: Pool | PoolClient,
  publicKey: PublicKeyBytes,
  userId: string,
  curveType: CurveType,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<GetKeyShareV2ResponseWallet>> {
  const getWalletRes = await getWalletByPublicKey(db, publicKey);
  if (getWalletRes.success === false) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to getWalletByPublicKey: ${getWalletRes.err}`,
    };
  }

  if (getWalletRes.data === null) {
    return {
      success: false,
      code: "WALLET_NOT_FOUND",
      msg: `Wallet not found for curve_type: ${curveType}`,
    };
  }

  if (getWalletRes.data.user_id !== userId) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      msg: "Unauthorized: wallet belongs to different user",
    };
  }

  const getKeyShareRes = await getKeyShareByWalletId(
    db,
    getWalletRes.data.wallet_id,
  );
  if (getKeyShareRes.success === false) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to getKeyShareByWalletId: ${getKeyShareRes.err}`,
    };
  }

  if (getKeyShareRes.data === null) {
    return {
      success: false,
      code: "KEY_SHARE_NOT_FOUND",
      msg: `Key share not found for curve_type: ${curveType}`,
    };
  }

  const decryptedShare = await decryptDataAsync(
    getKeyShareRes.data.enc_share.toString("utf-8"),
    encryptionSecret,
  );

  return {
    success: true,
    data: {
      share_id: getKeyShareRes.data.share_id,
      share: decryptedShare,
    },
  };
}

export async function checkWalletKeyShare(
  db: Pool | PoolClient,
  publicKey: PublicKeyBytes,
  userId: string,
): Promise<CheckWalletResult> {
  const getWalletRes = await getWalletByPublicKey(db, publicKey);
  if (getWalletRes.success === false) {
    return { error: `Failed to getWalletByPublicKey: ${getWalletRes.err}` };
  }

  if (getWalletRes.data === null) {
    return { exists: false };
  }

  if (getWalletRes.data.user_id !== userId) {
    return { error: "Public key is not valid" };
  }

  const getKeyShareRes = await getKeyShareByWalletId(
    db,
    getWalletRes.data.wallet_id,
  );
  if (getKeyShareRes.success === false) {
    return { error: `Failed to getKeyShareByWalletId: ${getKeyShareRes.err}` };
  }

  return { exists: getKeyShareRes.data !== null };
}
