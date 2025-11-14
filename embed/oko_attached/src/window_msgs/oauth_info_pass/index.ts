import type {
  OkoWalletMsgOAuthInfoPass,
  OkoWalletMsgOAuthInfoPassAck,
  OkoWalletMsgOAuthSignInUpdate,
  OAuthSignInError,
} from "@oko-wallet/oko-sdk-core";

import { sendMsgToWindow } from "../send";
import {
  OKO_ATTACHED_POPUP,
  OKO_SDK_TARGET,
} from "@oko-wallet-attached/window_msgs/target";
import type { MsgEventContext } from "@oko-wallet-attached/window_msgs/types";
import { useAppState } from "@oko-wallet-attached/store/app";
import {
  setUserId,
  setUserProperties,
} from "@oko-wallet-attached/analytics/amplitude";
import type { UserSignInResult } from "@oko-wallet-attached/window_msgs/types";
import { buildRequestContext } from "./context";
import { handleExistingUser, handleNewUser, handleReshare } from "./user";
import type { OAuthRequestContext } from "./context";

import { bail } from "./errors";

export async function handleOAuthInfoPass(
  ctx: MsgEventContext,
  message: OkoWalletMsgOAuthInfoPass,
): Promise<void> {
  const { port } = ctx;
  const appState = useAppState.getState();

  let hasSignedIn = false;
  let isNewUser = false;
  const hostOrigin = message.payload.target_origin;

  try {
    const context = await buildRequestContext(appState, message);
    const flowOutcome = await processOAuthFlow(context);

    persistFlowResult(
      appState,
      context.hostOrigin,
      context.tokenInfo.email,
      flowOutcome.data,
    );

    hasSignedIn = true;
    isNewUser = flowOutcome.isNewUser;

    await sendSuccessUpdate(context.hostOrigin);
  } catch (error) {
    await bail(message, normalizeError(error));
    return;
  } finally {
    finalizeFlow(
      appState,
      hostOrigin,
      hasSignedIn,
      isNewUser,
      message.payload.auth_type ?? "google",
      port,
    );
  }
}

function persistFlowResult(
  appState: ReturnType<typeof useAppState.getState>,
  hostOrigin: string,
  email: string,
  result: {
    keyshare_1: string;
    jwtToken: string;
    walletId: string;
    publicKey: string;
  },
) {
  appState.setKeyshare_1(hostOrigin, result.keyshare_1);
  appState.setAuthToken(hostOrigin, result.jwtToken);
  appState.setWallet(hostOrigin, {
    walletId: result.walletId,
    publicKey: result.publicKey,
    email,
  });
}

async function sendSuccessUpdate(hostOrigin: string) {
  const updateMsg: OkoWalletMsgOAuthSignInUpdate = {
    target: OKO_SDK_TARGET,
    msg_type: "oauth_sign_in_update",
    payload: { success: true, data: null },
  };

  await sendMsgToWindow(window.parent, updateMsg, hostOrigin);
}

function finalizeFlow(
  appState: ReturnType<typeof useAppState.getState>,
  hostOrigin: string,
  hasSignedIn: boolean,
  isNewUser: boolean,
  authType: "google" | "auth0",
  port: MessagePort,
) {
  if (hasSignedIn) {
    const wallet = appState.getWallet(hostOrigin);
    if (wallet?.walletId) {
      setUserId(wallet.walletId);
      if (isNewUser) {
        setUserProperties({
          authType,
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

function normalizeError(error: unknown): OAuthSignInError {
  if (error && typeof error === "object" && "type" in error) {
    return error as OAuthSignInError;
  }

  return {
    type: "unknown",
    error: error instanceof Error ? error.message : String(error),
  };
}

export interface OAuthFlowResult {
  data: UserSignInResult;
  isNewUser: boolean;
}

export async function processOAuthFlow(
  context: OAuthRequestContext,
): Promise<OAuthFlowResult> {
  const { idToken, authType, userExists } = context;
  const meta = userExists.keyshare_node_meta;

  if (!userExists.exists) {
    const signInRes = await handleNewUser(idToken, meta, authType);
    if (!signInRes.success) {
      throw signInRes.err;
    }
    return {
      data: signInRes.data,
      isNewUser: true,
    };
  }

  if (userExists.needs_reshare) {
    const signInRes = await handleReshare(idToken, meta, authType);
    if (!signInRes.success) {
      throw signInRes.err;
    }
    return {
      data: signInRes.data,
      isNewUser: false,
    };
  }

  const signInRes = await handleExistingUser(idToken, meta, authType);
  if (!signInRes.success) {
    throw signInRes.err;
  }
  return {
    data: signInRes.data,
    isNewUser: false,
  };
}
