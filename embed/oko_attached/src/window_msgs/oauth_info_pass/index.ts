import type {
  OkoWalletMsgOAuthInfoPass,
  OkoWalletMsgOAuthInfoPassAck,
  OkoWalletMsgOAuthSignInUpdate,
  OAuthSignInError,
} from "@oko-wallet/oko-sdk-core";

import {
  OKO_ATTACHED_POPUP,
  OKO_SDK_TARGET,
} from "@oko-wallet-attached/window_msgs/target";
import { useAppState } from "@oko-wallet-attached/store/app";
import { postLog } from "@oko-wallet-attached/requests/logging";
import type {
  GoogleTokenInfo,
  MsgEventContext,
} from "@oko-wallet-attached/window_msgs/types";
import {
  checkUserExists,
  handleExistingUser,
  handleNewUser,
  handleReshare,
} from "./user";
import { sendMsgToWindow } from "../send";
import {
  setUserId,
  setUserProperties,
} from "@oko-wallet-attached/analytics/amplitude";

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

    const nonceRegistered = appState.getNonce(hostOrigin);
    if (!nonceRegistered) {
      await bail(message, { type: "nonce_missing" });
      return;
    }

    const idToken = message.payload.id_token;
    const tokenInfo = await verifyGoogleIdToken(idToken);
    if (tokenInfo.nonce !== nonceRegistered) {
      await bail(message, { type: "vendor_token_verification_failed" });
      return;
    }

    const apiKey = message.payload?.api_key;
    if (!apiKey) {
      await bail(message, { type: "api_key_missing" });
      return;
    }
    appState.setApiKey(hostOrigin, apiKey);

    const userExistsRes = await checkUserExists(tokenInfo.email);
    if (!userExistsRes.success) {
      console.log(22, userExistsRes);

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

    // new user sign up flow
    if (!userExists.exists) {
      const signInRes = await handleNewUser(
        idToken,
        userExists.keyshare_node_meta,
      );
      if (!signInRes.success) {
        await bail(message, signInRes.err);
        return;
      }
      const result = signInRes.data;
      appState.setKeyshare_1(hostOrigin, result.keyshare_1);
      appState.setAuthToken(hostOrigin, result.jwtToken);
      appState.setWallet(hostOrigin, {
        walletId: result.walletId,
        publicKey: result.publicKey,
        email: tokenInfo.email,
      });

      hasSignedIn = true;
      isNewUser = true;
    }
    // existing user sign in or reshare flow
    else {
      // reshare flow
      if (userExists.needs_reshare) {
        const signInRes = await handleReshare(
          idToken,
          userExists.keyshare_node_meta,
        );
        console.log(
          "[attached] handleReshare result: %s",
          JSON.stringify(signInRes, null, 2),
        );
        if (!signInRes.success) {
          await bail(message, signInRes.err);
          return;
        }
        const result = signInRes.data;
        appState.setKeyshare_1(hostOrigin, result.keyshare_1);
        appState.setAuthToken(hostOrigin, result.jwtToken);
        appState.setWallet(hostOrigin, {
          walletId: result.walletId,
          publicKey: result.publicKey,
          email: tokenInfo.email,
        });
      } else {
        const signInRes = await handleExistingUser(
          idToken,
          userExists.keyshare_node_meta,
        );
        if (!signInRes.success) {
          await bail(message, signInRes.err);
          return;
        }
        const result = signInRes.data;
        appState.setKeyshare_1(hostOrigin, result.keyshare_1);
        appState.setAuthToken(hostOrigin, result.jwtToken);
        appState.setWallet(hostOrigin, {
          walletId: result.walletId,
          publicKey: result.publicKey,
          email: tokenInfo.email,
        });
      }
    }

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
            authType: "google",
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

async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
  );

  if (!response.ok) {
    throw new Error(`Google authentication is invalid. Please sign in again.`);
  }

  return await response.json();
}

async function bail(message: OkoWalletMsgOAuthInfoPass, err: OAuthSignInError) {
  postLog(
    {
      level: "error",
      message: "[attached] handling oauth sign-in fail",
      error: {
        name: "oauth_sign_in_error",
        message: JSON.stringify(err),
      },
    },
    { console: true },
  );

  const updateMsg: OkoWalletMsgOAuthSignInUpdate = {
    target: OKO_SDK_TARGET,
    msg_type: "oauth_sign_in_update",
    payload: { success: false, err },
  };

  // NOTE: The origin here is taken from the payload because sometimes that
  // callback comes from a different window in the attached. In that case,
  // `event.origin` comes from the origin of the attached
  const hostOrigin = message.payload.target_origin;
  await sendMsgToWindow(window.parent, updateMsg, hostOrigin);
}
