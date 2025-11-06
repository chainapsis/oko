import type {
  CheckEmailRequest,
  CheckEmailResponse,
  SignInResponse,
} from "@oko-wallet/oko-types/user";
import type {
  KeygenBody,
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
} from "@oko-wallet-attached/requests/oko_api";
import { combineUserShares } from "@oko-wallet-attached/crypto/combine";
import type { UserSignInResult } from "@oko-wallet-attached/window_msgs/types";
import type { FetchError } from "@oko-wallet-attached/requests/types";
import { reshareUserKeyShares } from "@oko-wallet-attached/crypto/reshare";
import {
  doSendUserKeyShares,
  requestSplitShares,
} from "@oko-wallet-attached/requests/ks_node";
import {
  importExternalSecretKey,
  runKeygen,
} from "@oko-wallet/cait-sith-keplr-hooks";
import { reqKeygen } from "@oko-wallet/api-lib";
import { Bytes } from "@oko-wallet/bytes";

export async function handleExistingUser(
  idToken: string,
  keyshareNodeMeta: KeyShareNodeMetaWithNodeStatusInfo,
): Promise<Result<UserSignInResult, OAuthSignInError>> {
  // 1. sign in to api server
  const signInRes = await makeAuthorizedOkoApiRequest<any, SignInResponse>(
    "user/signin",
    idToken,
    {},
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

  return {
    success: true,
    data: {
      publicKey: signInResp.user.public_key,
      walletId: signInResp.user.wallet_id,
      jwtToken: signInResp.token,
      keyshare_1: keyshare_1_res.data,
    },
  };
}

export async function handleNewUser(
  idToken: string,
  keyshareNodeMeta: KeyShareNodeMetaWithNodeStatusInfo,
): Promise<Result<UserSignInResult, OAuthSignInError>> {
  // TODO: @jinwoo, (wip) importing secret key
  // const keygenRes = keygenOptions?.secretKeyImport
  //   ? await importExternalSecretKey(keygenOptions.secretKeyImport)
  //   : await runKeygen();
  const keygenRes = await runKeygen();
  if (keygenRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: keygenRes.err },
    };
  }
  const { keygen_1, keygen_2 } = keygenRes.data;

  const splitUserKeySharesRes = await splitUserKeyShares(
    keygen_1,
    keyshareNodeMeta,
  );
  if (splitUserKeySharesRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: splitUserKeySharesRes.err },
    };
  }
  const publicKey = keygen_1.public_key;
  const userKeyShares = splitUserKeySharesRes.data;

  const sendKeySharesResult: Result<void, string>[] = await Promise.all(
    userKeyShares.map((keyShareByNode) =>
      doSendUserKeyShares(
        keyShareByNode.node.endpoint,
        idToken,
        publicKey,
        keyShareByNode.share,
      ),
    ),
  );
  const errResults = sendKeySharesResult.filter(
    (result) => result.success === false,
  );
  if (errResults.length > 0) {
    return {
      success: false,
      err: {
        type: "sign_in_request_fail",
        error: errResults.map((result) => result.err).join("\n"),
      },
    };
  }

  const keygenRequest: KeygenBody = {
    keygen_2: {
      public_key: publicKey.toHex(),
      private_share: keygen_2.tss_private_share.toHex(),
    },
  };

  const reqKeygenRes = await reqKeygen(TSS_V1_ENDPOINT, keygenRequest, idToken);
  if (reqKeygenRes.success === false) {
    return {
      success: false,
      err: { type: "sign_in_request_fail", error: reqKeygenRes.msg },
    };
  }

  return {
    success: true,
    data: {
      publicKey: reqKeygenRes.data.user.public_key,
      walletId: reqKeygenRes.data.user.wallet_id,
      jwtToken: reqKeygenRes.data.token,
      keyshare_1: keygen_1.tss_private_share.toHex(),
    },
  };
}

export async function handleReshare(
  idToken: string,
  keyshareNodeMeta: KeyShareNodeMetaWithNodeStatusInfo,
): Promise<Result<UserSignInResult, OAuthSignInError>> {
  const signInRes = await makeAuthorizedOkoApiRequest<any, SignInResponse>(
    "user/signin",
    idToken,
    {},
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

  const keyshare_1_res = await reshareUserKeyShares(
    publicKey,
    idToken,
    keyshareNodeMeta,
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
    },
  };
}

export async function checkUserExists(
  email: string,
): Promise<Result<OkoApiResponse<CheckEmailResponse>, FetchError>> {
  const res = await makeOkoApiRequest<CheckEmailRequest, CheckEmailResponse>(
    "user/check",
    {
      email,
    },
  );

  return res;
}
