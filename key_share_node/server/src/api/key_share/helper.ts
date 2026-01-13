import type { Pool, PoolClient } from "pg";
import {
  createKeyShare,
  createWallet,
  getKeyShareByWalletId,
  getWalletByPublicKey,
} from "@oko-wallet/ksn-pg-interface";
import type {
  CheckWalletResult,
  GetKeyShareV2ResponseWallet,
  PublicKeyBytes,
  WalletRegisterInfo,
} from "@oko-wallet/ksn-interface/key_share";
import type { CurveType } from "@oko-wallet/ksn-interface/curve_type";
import type { KSNodeApiResponse } from "@oko-wallet/ksn-interface/response";

import {
  decryptDataAsync,
  encryptDataAsync,
} from "@oko-wallet-ksn-server/encrypt";

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

/**
 * Register a single wallet and its key share within a transaction
 * Used by registerKeyShareV2 to register multiple wallets atomically
 */
export async function registerWalletKeyShare(
  client: PoolClient,
  walletInfo: WalletRegisterInfo<PublicKeyBytes>,
  userId: string,
  curveType: CurveType,
  encryptionSecret: string,
): Promise<KSNodeApiResponse<void>> {
  const { public_key, share } = walletInfo;

  // Check for duplicate public key
  const getWalletRes = await getWalletByPublicKey(client, public_key);
  if (getWalletRes.success === false) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to getWalletByPublicKey: ${getWalletRes.err}`,
    };
  }

  if (getWalletRes.data !== null) {
    return {
      success: false,
      code: "DUPLICATE_PUBLIC_KEY",
      msg: `Duplicate public key for curve_type: ${curveType}`,
    };
  }

  // Create wallet
  const createWalletRes = await createWallet(client, {
    user_id: userId,
    curve_type: curveType,
    public_key: public_key.toUint8Array(),
  });
  if (createWalletRes.success === false) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to createWallet: ${createWalletRes.err}`,
    };
  }

  // Encrypt and create key share
  const encryptedShare = await encryptDataAsync(
    share.toHex(),
    encryptionSecret,
  );
  const encryptedShareBuffer = Buffer.from(encryptedShare, "utf-8");

  const createKeyShareRes = await createKeyShare(client, {
    wallet_id: createWalletRes.data.wallet_id,
    enc_share: encryptedShareBuffer,
  });
  if (createKeyShareRes.success === false) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to createKeyShare: ${createKeyShareRes.err}`,
    };
  }

  return { success: true, data: void 0 };
}
