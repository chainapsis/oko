import type { Result } from "@oko-wallet/stdlib-js";
import type {
  OkoWalletMsgOAuthInfoPass,
  OkoWalletMsgOAuthInfoPassAck,
  OkoWalletMsgOAuthSignInUpdate,
  OAuthSignInError,
} from "@oko-wallet/oko-sdk-core";
import type { CheckEmailResponse } from "@oko-wallet/oko-types/user";
import type { OAuthProvider } from "@oko-wallet/oko-types/auth";

import { sendMsgToWindow } from "../send";
import {
  OKO_ATTACHED_POPUP,
  OKO_SDK_TARGET,
} from "@oko-wallet-attached/window_msgs/target";
import type { MsgEventContext } from "@oko-wallet-attached/window_msgs/types";
import { useAppState } from "@oko-wallet-attached/store/app";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import {
  setUserId,
  setUserProperties,
} from "@oko-wallet-attached/analytics/amplitude";
import type { UserSignInResult } from "@oko-wallet-attached/window_msgs/types";
import {
  checkUserExists,
  handleExistingUser,
  handleNewUser,
  handleReshare,
} from "./user";
import { bail } from "./errors";
import { getCredentialsFromPayload } from "./validate_social_login";

export async function handleOAuthInfoPass(
  ctx: MsgEventContext,
  message: OkoWalletMsgOAuthInfoPass,
): Promise<void> {
  const { port } = ctx;
  const appState = useAppState.getState();
  const hostOrigin = message.payload.target_origin;

  let hasSignedIn = false;
  let isNewUser = false;

  try {
    if (message.msg_type !== "oauth_info_pass") {
      await bail(message, {
        type: "invalid_msg_type",
        msg_type: message.msg_type,
      });
      return;
    }

    if (!appState.getHostOriginList().includes(hostOrigin)) {
      await bail(message, { type: "origin_not_registered" });
      return;
    }

    const apiKey = message.payload.api_key;
    if (!apiKey) {
      await bail(message, { type: "api_key_missing" });
      return;
    }
    appState.setApiKey(hostOrigin, apiKey);

    const authType: OAuthProvider = message.payload.auth_type;

    const validateOauthRes = await getCredentialsFromPayload(
      message.payload,
      hostOrigin,
    );

    if (!validateOauthRes.success) {
      await bail(message, validateOauthRes.err);
      return;
    }

    const { idToken, userIdentifier } = validateOauthRes.data;

    const userExistsRes = await checkUserExists(userIdentifier);
    if (!userExistsRes.success) {
      await bail(message, {
        type: "check_user_request_fail",
        error: userExistsRes.err.toString(),
      });
      return;
    }

    const userExistsResp = userExistsRes.data;
    if (!userExistsResp.success) {
      await bail(message, {
        type: "check_user_request_fail",
        error: userExistsResp.msg,
      });
      return;
    }
    const userExists = userExistsResp.data;

    // Highest-priority guard: global active nodes below threshold → block all flows
    if (userExists.active_nodes_below_threshold) {
      await bail(message, {
        type: "active_nodes_below_threshold",
      });
      return;
    }

    const handleUserSignInRes = await handleUserSignIn(
      idToken,
      userExists,
      authType,
    );
    if (!handleUserSignInRes.success) {
      await bail(message, handleUserSignInRes.err);
      return;
    }

    const signInResult = handleUserSignInRes.data;
    appState.setKeyshare_1(hostOrigin, signInResult.keyshare_1);
    appState.setAuthToken(hostOrigin, signInResult.jwtToken);
    appState.setWallet(hostOrigin, {
      walletId: signInResult.walletId,
      publicKey: signInResult.publicKey,
      email: userIdentifier,
    });

    hasSignedIn = true;
    isNewUser = signInResult.isNewUser;

    const updateMsg: OkoWalletMsgOAuthSignInUpdate = {
      target: OKO_SDK_TARGET,
      msg_type: "oauth_sign_in_update",
      payload: { success: true, data: null },
    };

    await sendMsgToWindow(window.parent, updateMsg, hostOrigin);
  } catch (error: any) {
    await bail(message, { type: "unknown", error: error.toString() });
    return;
  } finally {
    if (hasSignedIn) {
      const wallet = appState.getWallet(hostOrigin);
      if (wallet?.walletId) {
        setUserId(wallet.walletId);
        if (isNewUser) {
          setUserProperties({
            authType: message.payload.auth_type,
            createdOrigin: hostOrigin,
          });
        }
      }
    }

    const infoPassAck: OkoWalletMsgOAuthInfoPassAck = {
      target: OKO_ATTACHED_POPUP,
      msg_type: "oauth_info_pass_ack",
      payload: null,
    };

    port.postMessage(infoPassAck);
    appState.setNonce(hostOrigin, null);
  }
}

export async function handleUserSignIn(
  idToken: string,
  userExists: CheckEmailResponse,
  authType: OAuthProvider,
): Promise<Result<UserSignInResult, OAuthSignInError>> {
  const meta = userExists.keyshare_node_meta;

  // use user sign up flow
  if (!userExists.exists) {
    const { referralInfo } = useMemoryState.getState();
    const signInRes = await handleNewUser(
      idToken,
      meta,
      authType,
      referralInfo,
    );
    if (!signInRes.success) {
      return {
        success: false,
        err: signInRes.err,
      };
    }
    return {
      success: true,
      data: signInRes.data,
    };
  }
  // existing user sign in or reshare flow
  else {
    // reshare flow
    if (userExists.needs_reshare) {
      const signInRes = await handleReshare(idToken, meta, authType);
      if (!signInRes.success) {
        throw signInRes.err;
      }
      return {
        success: true,
        data: signInRes.data,
      };
    }
    // sign in flow
    else {
      const signInRes = await handleExistingUser(idToken, meta, authType);
      if (!signInRes.success) {
        throw signInRes.err;
      }
      return {
        success: true,
        data: signInRes.data,
      };
    }
  }
}
