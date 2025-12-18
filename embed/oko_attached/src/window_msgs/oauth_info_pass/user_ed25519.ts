import type { OAuthProvider } from "@oko-wallet/oko-types/auth";
import type { Result } from "@oko-wallet/stdlib-js";
import type { OAuthSignInError } from "@oko-wallet/oko-sdk-core";
import { runTeddsaKeygen } from "@oko-wallet/teddsa-hooks";
import {
  reqKeygenEd25519,
  reqSignInEd25519,
  type KeygenEd25519RequestBody,
} from "@oko-wallet/api-lib";

import { teddsaKeygenToHex } from "@oko-wallet-attached/crypto/keygen_ed25519";
import { TSS_V1_ENDPOINT } from "@oko-wallet-attached/requests/oko_api";

import type { UserSignInResultEd25519 } from "@oko-wallet-attached/window_msgs/types";

/**
 * Handle new user Ed25519 wallet creation.
 *
 * For ed25519, we use a simplified flow:
 * 1. Generate a 2-of-2 threshold Ed25519 key
 * 2. Store keygen_1 locally (encrypted in browser storage)
 * 3. Register keygen_2 with the backend
 *
 * Unlike secp256k1, we don't split keygen_1 among keyshare nodes because
 * FROST key_packages are larger and have different structure than private_shares.
 */
export async function handleNewUserEd25519(
  idToken: string,
  _authType: OAuthProvider,
): Promise<Result<UserSignInResultEd25519, OAuthSignInError>> {
  // 1. Generate 2-of-2 threshold Ed25519 key
  const keygenRes = await runTeddsaKeygen();
  if (keygenRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: keygenRes.err },
    };
  }
  const { keygen_1, keygen_2 } = keygenRes.data;

  // 2. Register keygen_2 with backend
  const keygen2Hex = teddsaKeygenToHex(keygen_2);
  const keygenRequest: KeygenEd25519RequestBody = {
    keygen_2: {
      key_package: keygen2Hex.key_package,
      public_key_package: keygen2Hex.public_key_package,
      public_key: keygen2Hex.public_key,
    },
  };

  const reqKeygenRes = await reqKeygenEd25519(
    TSS_V1_ENDPOINT,
    keygenRequest,
    idToken,
  );
  if (reqKeygenRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: reqKeygenRes.msg },
    };
  }

  // Return keygen_1's data for client-side signing
  const keygen1Hex = teddsaKeygenToHex(keygen_1);

  return {
    success: true,
    data: {
      publicKey: reqKeygenRes.data.user.public_key,
      walletId: reqKeygenRes.data.user.wallet_id,
      jwtToken: reqKeygenRes.data.token,
      keyPackage: keygen1Hex.key_package,
      publicKeyPackage: keygen1Hex.public_key_package,
      isNewUser: true,
    },
  };
}

/**
 * Check if user has an existing Ed25519 wallet.
 */
export async function checkUserHasEd25519Wallet(
  authToken: string,
): Promise<
  Result<{ hasWallet: boolean; walletId?: string; publicKey?: string }, string>
> {
  try {
    const response = await fetch(
      `${TSS_V1_ENDPOINT}/user/check_ed25519_wallet`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      return {
        success: false,
        err: `Failed to check ed25519 wallet: ${response.status}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        err: data.msg || "Failed to check ed25519 wallet",
      };
    }

    // Check if user has ed25519 wallet
    if (!data.data.has_wallet) {
      return {
        success: true,
        data: { hasWallet: false },
      };
    }

    return {
      success: true,
      data: {
        hasWallet: true,
        walletId: data.data.wallet_id,
        publicKey: data.data.public_key,
      },
    };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

/**
 * Handle existing user Ed25519 wallet sign-in.
 *
 * For existing users requesting ed25519:
 * 1. Check if they have an ed25519 wallet on the server
 * 2. If NO wallet → create new one (same as new user flow)
 * 3. If YES wallet → sign in and return wallet info (keyPackage from local storage)
 */
export async function handleExistingUserEd25519(
  idToken: string,
  authType: OAuthProvider,
): Promise<Result<UserSignInResultEd25519, OAuthSignInError>> {
  // 1. Check if user already has an ed25519 wallet
  const checkRes = await checkUserHasEd25519Wallet(idToken);
  if (checkRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: checkRes.err },
    };
  }

  // 2. If no ed25519 wallet exists, create one (same flow as new user)
  if (!checkRes.data.hasWallet) {
    return handleNewUserEd25519(idToken, authType);
  }

  // 3. User has ed25519 wallet - sign in to get JWT token
  const signInRes = await reqSignInEd25519(TSS_V1_ENDPOINT, idToken);
  if (signInRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: signInRes.msg },
    };
  }

  // Return wallet info without keyPackage (caller should get from local storage)
  return {
    success: true,
    data: {
      publicKey: signInRes.data.user.public_key,
      walletId: signInRes.data.user.wallet_id,
      jwtToken: signInRes.data.token,
      // keyPackage and publicKeyPackage are NOT included
      // Caller should retrieve from local storage
      isNewUser: false,
    },
  };
}
