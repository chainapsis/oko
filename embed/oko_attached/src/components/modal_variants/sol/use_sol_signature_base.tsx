import { useState } from "react";
import type {
  MakeSolSigError,
  OpenModalAckPayload,
} from "@oko-wallet/oko-sdk-core";

import { useAppState } from "@oko-wallet-attached/store/app";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import { DEMO_WEB_ORIGIN } from "@oko-wallet-attached/requests/endpoints";
import {
  makeSignOutputEd25519,
  type KeyPackageEd25519,
} from "@oko-wallet-attached/crypto/sign_ed25519";
import { teddsaKeygenFromHex } from "@oko-wallet-attached/crypto/keygen_ed25519";

export interface UseSolSignatureBaseArgs {
  modalId: string;
  hostOrigin: string;
  getIsAborted: () => boolean;
}

export interface SigningContext {
  keyPackage: KeyPackageEd25519;
  apiKey: string;
  authToken: string;
  getIsAborted: () => boolean;
}

export type SigningResult =
  | { success: true; signature: string }
  | { success: true; signatures: string[] }
  | { success: false };

/**
 * Sign a single message and return hex-encoded signature
 */
export async function signMessageToHex(
  message: Uint8Array,
  ctx: SigningContext,
): Promise<{ success: true; signature: string } | { success: false; error: MakeSolSigError }> {
  const signatureRes = await makeSignOutputEd25519(
    message,
    ctx.keyPackage,
    ctx.apiKey,
    ctx.authToken,
    ctx.getIsAborted,
  );

  if (!signatureRes.success) {
    return { success: false, error: signatureRes.err };
  }

  const signatureHex = Array.from(signatureRes.data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { success: true, signature: signatureHex };
}

export function useSolSignatureBase(args: UseSolSignatureBaseArgs) {
  const { modalId, hostOrigin, getIsAborted } = args;
  const { closeModal, setError } = useMemoryState();

  const theme = useAppState().getTheme(hostOrigin);
  const apiKey = useAppState().getApiKey(hostOrigin);
  const authToken = useAppState().getAuthToken(hostOrigin);
  const keyPackageHex = useAppState().getKeyPackageEd25519(hostOrigin);

  const [isLoading, setIsLoading] = useState(false);

  const isDemo = !!hostOrigin && hostOrigin === DEMO_WEB_ORIGIN;
  const isApproveEnabled = !!keyPackageHex && !!apiKey && !!authToken;

  function onReject() {
    const ack: OpenModalAckPayload = {
      modal_type: "sol/make_signature",
      modal_id: modalId,
      type: "reject",
    };
    closeModal(ack);
  }

  function emitError(error: MakeSolSigError) {
    setError({
      modal_type: "sol/make_signature",
      modal_id: modalId,
      type: "error",
      error,
    });
  }

  function emitUnknownError(message: string) {
    emitError({ type: "unknown_error", error: message });
  }

  function closeWithSignature(signature: string) {
    const ack: OpenModalAckPayload = {
      modal_type: "sol/make_signature",
      modal_id: modalId,
      type: "approve",
      data: {
        chain_type: "sol",
        sig_result: { type: "signature", signature },
      },
    };
    closeModal(ack);
  }

  function closeWithSignatures(signatures: string[]) {
    const ack: OpenModalAckPayload = {
      modal_type: "sol/make_signature",
      modal_id: modalId,
      type: "approve",
      data: {
        chain_type: "sol",
        sig_result: { type: "signatures", signatures },
      },
    };
    closeModal(ack);
  }

  /**
   * Prepare signing context. Returns null if validation fails.
   */
  function prepareSigningContext(): SigningContext | null {
    if (!keyPackageHex || !apiKey || !authToken) {
      emitUnknownError("Missing key package, API key, or auth token");
      return null;
    }

    const keyPackageRes = teddsaKeygenFromHex(keyPackageHex);
    if (!keyPackageRes.success) {
      emitUnknownError(keyPackageRes.err);
      return null;
    }

    return {
      keyPackage: {
        keyPackage: keyPackageRes.data.key_package,
        publicKeyPackage: keyPackageRes.data.public_key_package,
        identifier: keyPackageRes.data.identifier,
      },
      apiKey,
      authToken,
      getIsAborted,
    };
  }

  return {
    // State
    isLoading,
    setIsLoading,
    isApproveEnabled,
    isDemo,
    theme,

    // Actions
    onReject,
    emitError,
    emitUnknownError,
    closeWithSignature,
    closeWithSignatures,

    // Signing
    prepareSigningContext,
    getIsAborted,
  };
}
