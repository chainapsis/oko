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
import {
  requestKeySharesV2,
  registerKeySharesV2,
  registerKeyShareEd25519V2,
} from "@oko-wallet-attached/requests/ks_node_v2";
import {
  decodeKeyShareStringToPoint256,
  encodePoint256ToKeyShareString,
} from "@oko-wallet-attached/crypto/key_share_utils";
import type { UserKeySharePointByNode } from "@oko-wallet/oko-types/user_key_share";
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
  const secp256k1UserKeyShares = splitUserKeySharesRes.data;

  // 4. ed25519 key share split @TODO
  // const ed25519UserKeyShares = await splitUserKeySharesEd25519(
  //   ed25519Keygen1,
  //   keyshareNodeMeta,
  // );

  // 5. Send key shares by both curves to ks nodes using V2 API
  const registerKeySharesResults: Result<void, string>[] = await Promise.all(
    secp256k1UserKeyShares.map((keyShareByNode) =>
      registerKeySharesV2(keyShareByNode.node.endpoint, idToken, authType, {
        secp256k1: {
          public_key: secp256k1Keygen1.public_key.toHex(),
          share: encodePoint256ToKeyShareString(keyShareByNode.share),
        },
        // ed25519: {
        //   public_key: ed25519Keygen1.public_key.toHex(),
        //   share: ed25519UserKeyShares[index].share, // TODO: encode ed25519 share
        // },
      }),
    ),
  );
  const registerErrResults = registerKeySharesResults.filter(
    (result) => result.success === false,
  );
  if (registerErrResults.length > 0) {
    return {
      success: false,
      err: {
        type: "sign_in_request_fail",
        error: registerErrResults.map((result) => result.err).join("\n"),
      },
    };
  }

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
 * Handle existing user who has both secp256k1 and ed25519 wallets.
 * Called when checkEmailV2 returns CheckEmailResponseV2ExistingUser with both wallets.
 */
export async function handleExistingUserV2(
  idToken: string,
  keyshareNodeMetaSecp256k1: KeyShareNodeMetaWithNodeStatusInfo,
  keyshareNodeMetaEd25519: KeyShareNodeMetaWithNodeStatusInfo,
  authType: AuthType,
): Promise<Result<UserSignInResultV2, OAuthSignInError>> {
  // 1. Sign in to API server
  const signInRes = await makeAuthorizedOkoApiRequest<any, SignInResponseV2>(
    "user/signin",
    idToken,
    {
      auth_type: authType,
    },
    TSS_V2_ENDPOINT,
  );
  if (!signInRes.success) {
    console.error("[attached] sign in failed, err: %s", signInRes.err);
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: signInRes.err.toString() },
    };
  }

  const apiResponse = signInRes.data;
  if (!apiResponse.success) {
    console.error(
      "[attached] sign in request failed, err: %s",
      apiResponse.msg,
    );
    return {
      success: false,
      err: {
        type: "sign_in_request_fail",
        error: `code: ${apiResponse.code}`,
      },
    };
  }

  const signInResp = apiResponse.data;

  // 2. Request secp256k1 and ed25519 shares from KS nodes using V2 API
  const requestSharesRes = await requestKeySharesV2(
    idToken,
    keyshareNodeMetaSecp256k1.nodes,
    keyshareNodeMetaSecp256k1.threshold,
    authType,
    {
      secp256k1: signInResp.user.public_key_secp256k1,
      ed25519: signInResp.user.public_key_ed25519,
    },
  );
  if (!requestSharesRes.success) {
    const error = requestSharesRes.err;

    if (error.code === "WALLET_NOT_FOUND") {
      console.error(
        "[attached] detected share loss on node: %s",
        error.affectedNode?.name,
      );
      // TODO: handle reshare case for V2
      return {
        success: false,
        err: {
          type: "reshare_fail",
          error: `Wallet not found on node: ${error.affectedNode?.name}`,
        },
      };
    }

    console.error(
      `[attached] insufficient shares: got ${error.got}/${error.need}`,
    );
    return {
      success: false,
      err: {
        type: "insufficient_shares",
      },
    };
  }

  // 3. Combine secp256k1 shares (convert hex strings to Point256)
  const secp256k1SharesByNode: UserKeySharePointByNode[] = [];
  for (const item of requestSharesRes.data) {
    const shareHex = item.shares.secp256k1;
    if (!shareHex) {
      return {
        success: false,
        err: {
          type: "key_share_combine_fail",
          error: `secp256k1 share missing from node: ${item.node.name}`,
        },
      };
    }
    const point256Res = decodeKeyShareStringToPoint256(shareHex);
    if (point256Res.success === false) {
      return {
        success: false,
        err: {
          type: "key_share_combine_fail",
          error: `secp256k1 decode err: ${point256Res.err}`,
        },
      };
    }
    secp256k1SharesByNode.push({
      node: item.node,
      share: point256Res.data,
    });
  }

  const keyshare1Secp256k1Res = await combineUserShares(
    secp256k1SharesByNode,
    keyshareNodeMetaSecp256k1.threshold,
  );
  if (keyshare1Secp256k1Res.success === false) {
    return {
      success: false,
      err: {
        type: "key_share_combine_fail",
        error: `secp256k1 combine err: ${keyshare1Secp256k1Res.err}`,
      },
    };
  }

  // 4. Combine ed25519 shares @TODO
  // const ed25519SharesByNode = requestSharesRes.data.map((item) => ({
  //   node: item.node,
  //   share: item.shares.ed25519!,
  // }));
  // const keyshare1Ed25519Res = await combineUserSharesEd25519(
  //   ed25519SharesByNode,
  //   keyshareNodeMetaEd25519.threshold,
  // );
  const keyshare1Ed25519 = ""; // TODO: replace with combined result

  return {
    success: true,
    data: {
      publicKeySecp256k1: signInResp.user.public_key_secp256k1,
      publicKeyEd25519: signInResp.user.public_key_ed25519,
      walletIdSecp256k1: signInResp.user.wallet_id_secp256k1,
      walletIdEd25519: signInResp.user.wallet_id_ed25519,
      jwtToken: signInResp.token,
      keyshare1Secp256k1: keyshare1Secp256k1Res.data,
      keyshare1Ed25519,
      isNewUser: false,
      email: signInResp.user.email ?? null,
      name: signInResp.user.name ?? null,
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
  // 1. Request secp256k1 shares from KS nodes using V2 API
  const requestSharesRes = await requestKeySharesV2(
    idToken,
    keyshareNodeMetaSecp256k1.nodes,
    keyshareNodeMetaSecp256k1.threshold,
    authType,
    {
      secp256k1: secp256k1PublicKey,
    },
  );
  if (!requestSharesRes.success) {
    const error = requestSharesRes.err;

    if (error.code === "WALLET_NOT_FOUND") {
      console.error(
        "[attached] detected share loss on node: %s",
        error.affectedNode?.name,
      );
      return {
        success: false,
        err: {
          type: "reshare_fail",
          error: `Wallet not found on node: ${error.affectedNode?.name}`,
        },
      };
    }

    console.error(
      `[attached] insufficient shares: got ${error.got}/${error.need}`,
    );
    return {
      success: false,
      err: {
        type: "insufficient_shares",
      },
    };
  }

  // 2. Combine secp256k1 shares (convert hex strings to Point256)
  const secp256k1SharesByNode: UserKeySharePointByNode[] = [];
  for (const item of requestSharesRes.data) {
    const shareHex = item.shares.secp256k1;
    if (!shareHex) {
      return {
        success: false,
        err: {
          type: "key_share_combine_fail",
          error: `secp256k1 share missing from node: ${item.node.name}`,
        },
      };
    }
    const point256Res = decodeKeyShareStringToPoint256(shareHex);
    if (point256Res.success === false) {
      return {
        success: false,
        err: {
          type: "key_share_combine_fail",
          error: `secp256k1 decode err: ${point256Res.err}`,
        },
      };
    }
    secp256k1SharesByNode.push({
      node: item.node,
      share: point256Res.data,
    });
  }

  const keyshare1Secp256k1Res = await combineUserShares(
    secp256k1SharesByNode,
    keyshareNodeMetaSecp256k1.threshold,
  );
  if (keyshare1Secp256k1Res.success === false) {
    return {
      success: false,
      err: {
        type: "key_share_combine_fail",
        error: `secp256k1 combine err: ${keyshare1Secp256k1Res.err}`,
      },
    };
  }

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
  // const ed25519UserKeyShares = await splitUserKeySharesEd25519(
  //   ed25519Keygen1,
  //   keyshareNodeMetaEd25519,
  // );

  // 5. Send ed25519 key shares to ks nodes using V2 API
  // Note: Using keyshareNodeMetaEd25519.nodes for ed25519 registration
  const registerEd25519Results: Result<void, string>[] = await Promise.all(
    keyshareNodeMetaEd25519.nodes.map((node) =>
      registerKeyShareEd25519V2(
        node.endpoint,
        idToken,
        authType,
        ed25519Keygen1.public_key.toHex(),
        "", // TODO: replace with ed25519UserKeyShares[index].share
      ),
    ),
  );
  const registerEd25519ErrResults = registerEd25519Results.filter(
    (result) => result.success === false,
  );
  if (registerEd25519ErrResults.length > 0) {
    return {
      success: false,
      err: {
        type: "sign_in_request_fail",
        error: registerEd25519ErrResults.map((result) => result.err).join("\n"),
      },
    };
  }

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
      keyshare1Secp256k1: keyshare1Secp256k1Res.data,
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
