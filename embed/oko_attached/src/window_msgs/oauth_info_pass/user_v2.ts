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
  requestSplitSharesEd25519,
} from "@oko-wallet-attached/requests/ks_node";
import { runKeygen } from "@oko-wallet/cait-sith-keplr-hooks";
import {
  runTeddsaKeygen,
  serializeKeyPackage,
  serializePublicKeyPackage,
} from "@oko-wallet/teddsa-hooks";
import { reqKeygen, reqKeygenV2 } from "@oko-wallet/api-lib";
import { Bytes } from "@oko-wallet/bytes";

import type { ReferralInfo } from "@oko-wallet-attached/store/memory/types";
import {
  teddsaKeygenToHex,
  type KeyPackageEd25519Hex,
} from "@oko-wallet-attached/crypto/keygen_ed25519";
import { saveReferral } from "./user";

export async function handleExistingUserV2(
  idToken: string,
  keyshareNodeMeta: KeyShareNodeMetaWithNodeStatusInfo,
  authType: AuthType,
  apiKey: string,
): Promise<Result<UserSignInResult, OAuthSignInError>> {
  // 1. sign in to api server
  const signInRes = await makeAuthorizedOkoApiRequest<any, SignInResponse>(
    "user/signin",
    idToken,
    {
      auth_type: authType,
    },
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
  const publicKeyRes = Bytes.fromHexString(signInResp.user.public_key, 33);
  if (publicKeyRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: publicKeyRes.err },
    };
  }
  const publicKey = publicKeyRes.data;

  // 2. request shares to ks nodes with automatic fallback
  const requestSharesRes = await requestSplitShares(
    publicKey,
    idToken,
    keyshareNodeMeta.nodes,
    keyshareNodeMeta.threshold,
    authType,
  );
  if (!requestSharesRes.success) {
    const error = requestSharesRes.err;

    // share lost on node, reshare is needed
    if (error.code === "WALLET_NOT_FOUND") {
      console.error(
        "[attached] detected share loss on node: %s, triggering reshare",
        error.affectedNode.name,
      );

      // Update keyshare node meta to mark the lost node
      const updatedNodeMeta: KeyShareNodeMetaWithNodeStatusInfo = {
        threshold: keyshareNodeMeta.threshold,
        nodes: keyshareNodeMeta.nodes.map((n) =>
          n.name === error.affectedNode.name
            ? {
                ...n,
                wallet_status: "UNRECOVERABLE_DATA_LOSS" as WalletKSNodeStatus,
              }
            : n,
        ),
      };

      const keyshare_1_res = await reshareUserKeyShares(
        publicKey,
        idToken,
        updatedNodeMeta,
        authType,
      );
      if (keyshare_1_res.success === false) {
        console.error("[attached] reshare failed, err: %s", keyshare_1_res.err);
        return {
          success: false,
          err: {
            type: "reshare_fail",
            error: `err: ${keyshare_1_res.err}, \
        user pk: ${signInResp.user.public_key}`,
          },
        };
      }

      return {
        success: true,
        data: {
          publicKey: signInResp.user.public_key,
          walletId: signInResp.user.wallet_id,
          jwtToken: signInResp.token,
          keyshare_1: keyshare_1_res.data,
          isNewUser: false,
          email: signInResp.user.email ?? null,
          name: signInResp.user.name ?? null,
          // keyPackageEd25519: null,
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

  // 3. combine shares
  const keyshare_1_res = await combineUserShares(
    requestSharesRes.data,
    keyshareNodeMeta.threshold,
  );
  if (keyshare_1_res.success === false) {
    return {
      success: false,
      err: {
        type: "key_share_combine_fail",
        error: `err: ${keyshare_1_res.err}, \
  user pk: ${signInResp.user.public_key}`,
      },
    };
  }

  // 4. Ed25519 keygen for Solana support (if user doesn't have Ed25519 wallet yet)
  // This is non-blocking - failure doesn't fail the entire sign-in
  let keyPackageEd25519: KeyPackageEd25519Hex | null = null;
  // Track updated JWT token (with wallet_id_ed25519) from Ed25519 keygen
  let updatedJwtToken: string | null = null;
  try {
    const ed25519KeygenRes = await runTeddsaKeygen();
    if (ed25519KeygenRes.success) {
      const { keygen_1: ed25519Keygen1, keygen_2: ed25519Keygen2 } =
        ed25519KeygenRes.data;

      // Send Ed25519 keygen_2 to server
      const serverRes = await fetch(`${TSS_V1_ENDPOINT}/keygen_ed25519`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          keygen_2: {
            key_package: ed25519Keygen2.key_package,
            public_key_package: ed25519Keygen2.public_key_package,
            identifier: [...ed25519Keygen2.identifier],
            public_key: [...ed25519Keygen2.public_key.toUint8Array()],
          },
        }),
      });

      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.success) {
          keyPackageEd25519 = teddsaKeygenToHex(ed25519Keygen1);
          // Capture new JWT that includes wallet_id_ed25519
          updatedJwtToken = serverData.data.token;
          console.log("[attached] Ed25519 keygen successful for existing user");

          // SSS split Ed25519 key_package and send to KS nodes
          try {
            // const { splitUserKeySharesEd25519 } = await import(
            //   "@oko-wallet-attached/crypto/sss_ed25519"
            // );
            const { doSendUserKeySharesEd25519 } =
              await import("@oko-wallet-attached/requests/ks_node");

            // const splitEd25519Res = await splitUserKeySharesEd25519(
            //   ed25519Keygen1,
            //   keyshareNodeMeta,
            // );

            // if (splitEd25519Res.success) {
            //   const ed25519KeyShares = splitEd25519Res.data;

            //   // Send Ed25519 shares to all KS nodes
            //   const sendEd25519Results = await Promise.all(
            //     ed25519KeyShares.map((keyShareByNode) =>
            //       doSendUserKeySharesEd25519(
            //         keyShareByNode.node.endpoint,
            //         idToken,
            //         ed25519Keygen1.public_key,
            //         keyShareByNode.share,
            //         authType,
            //       ),
            //     ),
            //   );

            //   const ed25519SendErrors = sendEd25519Results.filter(
            //     (result) => result.success === false,
            //   );
            //   if (ed25519SendErrors.length > 0) {
            //     console.warn(
            //       "[attached] Some Ed25519 key shares failed to send:",
            //       ed25519SendErrors.map((e) => e.err).join(", "),
            //     );
            //   } else {
            //     console.log(
            //       "[attached] Ed25519 key shares sent to KS nodes successfully",
            //     );
            //   }
            // } else {
            //   console.warn(
            //     "[attached] Ed25519 SSS split failed:",
            //     splitEd25519Res.err,
            //   );
            // }
          } catch (sssErr) {
            console.warn("[attached] Ed25519 SSS error:", sssErr);
          }
        } else if (serverData.code === "WALLET_ALREADY_EXISTS") {
          // User already has Ed25519 wallet, recover from KS nodes
          console.log(
            "[attached] Ed25519 wallet already exists, recovering from KS nodes",
          );
          try {
            // 1. Get Ed25519 public info from server
            const publicInfoRes = await fetch(
              `${TSS_V1_ENDPOINT}/wallet_ed25519/public_info`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({}),
              },
            );

            if (publicInfoRes.ok) {
              const publicInfoData = await publicInfoRes.json();
              if (publicInfoData.success) {
                const {
                  public_key: publicKeyHex,
                  public_key_package,
                  identifier,
                } = publicInfoData.data;

                // 2. Request Ed25519 shares from KS nodes
                const publicKeyBytesRes = Bytes.fromHexString(publicKeyHex, 32);
                if (publicKeyBytesRes.success) {
                  const sharesRes = await requestSplitSharesEd25519(
                    publicKeyBytesRes.data,
                    idToken,
                    keyshareNodeMeta.nodes,
                    keyshareNodeMeta.threshold,
                    authType,
                  );

                  if (sharesRes.success) {
                    // 3. Recover Ed25519 keygen output
                    // const recoveryRes = await recoverEd25519Keygen(
                    //   sharesRes.data,
                    //   keyshareNodeMeta.threshold,
                    //   Uint8Array.from(public_key_package),
                    //   Uint8Array.from(identifier),
                    //   publicKeyBytesRes.data,
                    // );
                    // if (recoveryRes.success) {
                    //   keyPackageEd25519 = teddsaKeygenToHex(recoveryRes.data);
                    //   console.log(
                    //     "[attached] Ed25519 key recovered successfully",
                    //   );
                    // } else {
                    //   console.warn(
                    //     "[attached] Ed25519 key recovery failed:",
                    //     recoveryRes.err,
                    //   );
                    // }
                  } else {
                    console.warn(
                      "[attached] Ed25519 shares request failed:",
                      sharesRes.err,
                    );
                  }
                } else {
                  console.warn(
                    "[attached] Invalid Ed25519 public key:",
                    publicKeyBytesRes.err,
                  );
                }
              } else {
                console.warn(
                  "[attached] Ed25519 public info request failed:",
                  publicInfoData.msg,
                );
              }
            } else {
              console.warn(
                "[attached] Ed25519 public info HTTP error:",
                publicInfoRes.status,
              );
            }
          } catch (recoveryErr) {
            console.warn("[attached] Ed25519 recovery error:", recoveryErr);
          }
        } else {
          console.warn(
            "[attached] Ed25519 server keygen failed:",
            serverData.msg,
          );
        }
      } else {
        // Non-2xx response - check if it's WALLET_ALREADY_EXISTS (409)
        try {
          const errorData = await serverRes.json();
          if (errorData.code === "WALLET_ALREADY_EXISTS") {
            // User already has Ed25519 wallet, recover from KS nodes
            console.log(
              "[attached] Ed25519 wallet already exists (409), recovering from KS nodes",
            );
            try {
              // 1. Get Ed25519 public info from server
              const publicInfoRes = await fetch(
                `${TSS_V1_ENDPOINT}/wallet_ed25519/public_info`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                  },
                  body: JSON.stringify({}),
                },
              );

              if (publicInfoRes.ok) {
                const publicInfoData = await publicInfoRes.json();
                if (publicInfoData.success) {
                  const {
                    public_key: publicKeyHex,
                    public_key_package,
                    identifier,
                  } = publicInfoData.data;

                  // 2. Request Ed25519 shares from KS nodes
                  const publicKeyBytesRes = Bytes.fromHexString(
                    publicKeyHex,
                    32,
                  );
                  if (publicKeyBytesRes.success) {
                    const sharesRes = await requestSplitSharesEd25519(
                      publicKeyBytesRes.data,
                      idToken,
                      keyshareNodeMeta.nodes,
                      keyshareNodeMeta.threshold,
                      authType,
                    );

                    if (sharesRes.success) {
                      // 3. Recover Ed25519 keygen output
                      // const recoveryRes = await recoverEd25519Keygen(
                      //   sharesRes.data,
                      //   keyshareNodeMeta.threshold,
                      //   Uint8Array.from(public_key_package),
                      //   Uint8Array.from(identifier),
                      //   publicKeyBytesRes.data,
                      // );
                      // if (recoveryRes.success) {
                      //   keyPackageEd25519 = teddsaKeygenToHex(recoveryRes.data);
                      //   console.log(
                      //     "[attached] Ed25519 key recovered successfully",
                      //   );
                      // } else {
                      //   console.warn(
                      //     "[attached] Ed25519 key recovery failed:",
                      //     recoveryRes.err,
                      //   );
                      // }
                    } else {
                      console.warn(
                        "[attached] Ed25519 shares request failed:",
                        sharesRes.err,
                      );
                    }
                  } else {
                    console.warn(
                      "[attached] Invalid Ed25519 public key:",
                      publicKeyBytesRes.err,
                    );
                  }
                } else {
                  console.warn(
                    "[attached] Ed25519 public info request failed:",
                    publicInfoData.msg,
                  );
                }
              } else {
                console.warn(
                  "[attached] Ed25519 public info HTTP error:",
                  publicInfoRes.status,
                );
              }
            } catch (recoveryErr) {
              console.warn("[attached] Ed25519 recovery error:", recoveryErr);
            }
          } else {
            console.warn(
              "[attached] Ed25519 server keygen request failed:",
              serverRes.status,
              errorData,
            );
          }
        } catch {
          console.warn(
            "[attached] Ed25519 server keygen request failed (non-JSON):",
            serverRes.status,
          );
        }
      }
    } else {
      console.warn("[attached] Ed25519 keygen failed:", ed25519KeygenRes.err);
    }
  } catch (err) {
    // Log but don't fail sign-in if Ed25519 keygen fails
    console.warn("[attached] Ed25519 keygen error:", err);
  }

  return {
    success: true,
    data: {
      publicKey: signInResp.user.public_key,
      walletId: signInResp.user.wallet_id,
      // Use updated JWT (with wallet_id_ed25519) if Ed25519 keygen succeeded
      jwtToken: updatedJwtToken ?? signInResp.token,
      keyshare_1: keyshare_1_res.data,
      isNewUser: false,
      email: signInResp.user.email ?? null,
      name: signInResp.user.name ?? null,
      // keyPackageEd25519,
    },
  };
}

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
