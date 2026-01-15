// TODO: refactor this file @chemonoworld @Ryz0nd

import type {
  CheckEmailRequest,
  CheckEmailResponse,
  CheckEmailResponseV2,
  SignInResponse,
  SignInResponseV2,
} from "@oko-wallet/oko-types/user";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type {
  KeygenRequestBody,
  KeyShareNodeMetaWithNodeStatusInfo,
  WalletKSNodeStatus,
} from "@oko-wallet/oko-types/tss";
import type { Result } from "@oko-wallet/stdlib-js";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { type OAuthSignInError } from "@oko-wallet/oko-sdk-core";

import { splitUserKeyShares } from "@oko-wallet-attached/crypto/keygen";
import {
  makeAuthorizedOkoApiRequest,
  makeOkoApiRequest,
  TSS_V1_ENDPOINT,
  SOCIAL_LOGIN_V1_ENDPOINT,
  TSS_V2_ENDPOINT,
} from "@oko-wallet-attached/requests/oko_api";
import { combineUserShares } from "@oko-wallet-attached/crypto/combine";
import type {
  UserSignInResult,
  UserSignInResultV2,
} from "@oko-wallet-attached/window_msgs/types";
import type { FetchError } from "@oko-wallet-attached/requests/types";
import { reshareUserKeyShares } from "@oko-wallet-attached/crypto/reshare";
import {
  doSendUserKeyShares,
  requestSplitShares,
} from "@oko-wallet-attached/requests/ks_node";
import { runKeygen } from "@oko-wallet/cait-sith-keplr-hooks";
import {
  runTeddsaKeygen,
  serializeKeyPackage,
  serializePublicKeyPackage,
} from "@oko-wallet/teddsa-hooks";
import { reqKeygenEd25519 } from "@oko-wallet/teddsa-api-lib";
import { reqKeygen, reqKeygenV2 } from "@oko-wallet/api-lib";
import { Bytes } from "@oko-wallet/bytes";

import type { ReferralInfo } from "@oko-wallet-attached/store/memory/types";
import {
  teddsaKeygenToHex,
  type KeyPackageEd25519Hex,
} from "@oko-wallet-attached/crypto/keygen_ed25519";
import { saveReferral } from "./user";

/**
 * Handle new user who needs both secp256k1 and ed25519 keygen.
 */
export async function handleNewUserV2(
  idToken: string,
  keyshareNodeMeta: KeyShareNodeMetaWithNodeStatusInfo,
  authType: AuthType,
  referralInfo?: ReferralInfo | null,
): Promise<Result<UserSignInResultV2, OAuthSignInError>> {
  // 1. secp256k1 keygen
  const secp256k1KeygenRes = await runKeygen();
  if (secp256k1KeygenRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: secp256k1KeygenRes.err },
    };
  }
  const { keygen_1: secp256k1Keygen1, keygen_2: secp256k1Keygen2 } =
    secp256k1KeygenRes.data;

  // 2. ed25519 keygen
  const ed25519KeygenRes = await runTeddsaKeygen();
  if (ed25519KeygenRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: ed25519KeygenRes.err },
    };
  }
  const { keygen_1: ed25519Keygen1, keygen_2: ed25519Keygen2 } =
    ed25519KeygenRes.data;

  // 3. secp256k1 key share split
  const splitUserKeySharesRes = await splitUserKeyShares(
    secp256k1Keygen1,
    keyshareNodeMeta,
  );
  if (splitUserKeySharesRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: splitUserKeySharesRes.err },
    };
  }

  // 4. ed25519 key share split @TODO

  // 5. Send key shares by both curves to ks nodes @TODO

  // 6. Call V2 keygen API with both curve types
  const reqKeygenV2Res = await reqKeygenV2(
    TSS_V2_ENDPOINT,
    {
      keygen_2_secp256k1: {
        public_key: secp256k1Keygen1.public_key.toHex(),
        private_share: secp256k1Keygen2.tss_private_share.toHex(),
      },
      keygen_2_ed25519: {
        key_package: serializeKeyPackage(ed25519Keygen2.key_package),
        public_key_package: serializePublicKeyPackage(
          ed25519Keygen2.public_key_package,
        ),
        identifier: [...ed25519Keygen2.identifier],
        public_key: [...ed25519Keygen2.public_key.toUint8Array()],
      },
    },
    idToken,
  );
  if (reqKeygenV2Res.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: reqKeygenV2Res.msg },
    };
  }

  // Save referral info after successful keygen
  if (referralInfo?.origin) {
    try {
      await saveReferral(reqKeygenV2Res.data.token, {
        origin: referralInfo.origin,
        utm_source: referralInfo.utmSource,
        utm_campaign: referralInfo.utmCampaign,
      });
    } catch (err) {
      // Log but don't fail keygen if referral save fails
      console.warn("[attached] Failed to save referral:", err);
    }
  }

  // 4. Convert ed25519 keygen1 to hex format for storage
  const keyPackageEd25519Hex = teddsaKeygenToHex(ed25519Keygen1);

  return {
    success: true,
    data: {
      publicKeySecp256k1: reqKeygenV2Res.data.user.public_key_secp256k1,
      publicKeyEd25519: reqKeygenV2Res.data.user.public_key_ed25519,
      walletIdSecp256k1: reqKeygenV2Res.data.user.wallet_id_secp256k1,
      walletIdEd25519: reqKeygenV2Res.data.user.wallet_id_ed25519,
      jwtToken: reqKeygenV2Res.data.token,
      keyshare1Secp256k1: secp256k1Keygen1.tss_private_share.toHex(),
      keyshare1Ed25519: JSON.stringify(keyPackageEd25519Hex),
      isNewUser: true,
      email: reqKeygenV2Res.data.user.email ?? null,
      name: reqKeygenV2Res.data.user.name ?? null,
    },
  };
}

/**
 * Handle existing user who has secp256k1 wallet but needs ed25519 keygen.
 * Called when checkEmailV2 returns CheckEmailResponseV2NeedsEd25519Keygen.
 */
export async function handleExistingUserNeedsEd25519Keygen(
  idToken: string,
  keyshareNodeMetaSecp256k1: KeyShareNodeMetaWithNodeStatusInfo,
  keyshareNodeMetaEd25519: KeyShareNodeMetaWithNodeStatusInfo,
  authType: AuthType,
  secp256k1PublicKey: string,
): Promise<Result<UserSignInResultV2, OAuthSignInError>> {
  // 1. Request secp256k1 shares from KS nodes @TODO
  // const requestSharesRes = await requestSplitShares(
  //   secp256k1PublicKeyBytes,
  //   idToken,
  //   keyshareNodeMetaSecp256k1.nodes,
  //   keyshareNodeMetaSecp256k1.threshold,
  //   authType,
  // );

  // 2. Combine secp256k1 shares @TODO
  // const keyshare1Secp256k1Res = await combineUserShares(
  //   requestSharesRes.data,
  //   keyshareNodeMetaSecp256k1.threshold,
  // );
  const keyshare1Secp256k1 = ""; // TODO: replace with combined result

  // 3. ed25519 keygen
  const ed25519KeygenRes = await runTeddsaKeygen();
  if (ed25519KeygenRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: ed25519KeygenRes.err },
    };
  }
  const { keygen_1: ed25519Keygen1, keygen_2: ed25519Keygen2 } =
    ed25519KeygenRes.data;

  // 4. ed25519 key share split @TODO

  // 5. Send ed25519 key shares to ks nodes @TODO

  // 6. Call keygenEd25519 API
  const reqKeygenEd25519Res = await reqKeygenEd25519(
    TSS_V2_ENDPOINT,
    {
      keygen_2: {
        key_package: serializeKeyPackage(ed25519Keygen2.key_package),
        public_key_package: serializePublicKeyPackage(
          ed25519Keygen2.public_key_package,
        ),
        identifier: [...ed25519Keygen2.identifier],
        public_key: [...ed25519Keygen2.public_key.toUint8Array()],
      },
    },
    idToken,
  );
  if (reqKeygenEd25519Res.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: reqKeygenEd25519Res.msg },
    };
  }

  // 7. Convert ed25519 keygen1 to hex format for storage
  const keyPackageEd25519Hex = teddsaKeygenToHex(ed25519Keygen1);

  return {
    success: true,
    data: {
      publicKeySecp256k1: reqKeygenEd25519Res.data.user.public_key_secp256k1,
      publicKeyEd25519: reqKeygenEd25519Res.data.user.public_key_ed25519,
      walletIdSecp256k1: reqKeygenEd25519Res.data.user.wallet_id_secp256k1,
      walletIdEd25519: reqKeygenEd25519Res.data.user.wallet_id_ed25519,
      jwtToken: reqKeygenEd25519Res.data.token,
      keyshare1Secp256k1,
      keyshare1Ed25519: JSON.stringify(keyPackageEd25519Hex),
      isNewUser: false,
      email: reqKeygenEd25519Res.data.user.email ?? null,
      name: reqKeygenEd25519Res.data.user.name ?? null,
    },
  };
}

export async function checkUserExistsV2(
  email: string,
  authType: AuthType,
): Promise<Result<OkoApiResponse<CheckEmailResponseV2>, FetchError>> {
  const res = await makeOkoApiRequest<CheckEmailRequest, CheckEmailResponseV2>(
    "user/check",
    {
      email,
      auth_type: authType,
    },
    TSS_V2_ENDPOINT,
  );

  return res;
}
