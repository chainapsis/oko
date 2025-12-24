import { useState } from "react";
import type {
  MakeSigModalErrorAckPayload,
  OpenModalAckPayload,
  MakeSolanaSigData,
} from "@oko-wallet/oko-sdk-core";

import { useAppState } from "@oko-wallet-attached/store/app";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import { DEMO_WEB_ORIGIN } from "@oko-wallet-attached/requests/endpoints";
import {
  makeSignOutputEd25519,
  type KeyPackageEd25519,
} from "@oko-wallet-attached/crypto/sign_ed25519";
import { teddsaKeygenFromHex } from "@oko-wallet-attached/crypto/keygen_ed25519";

export interface UseSolSigModalArgs {
  modalId: string;
  data: MakeSolanaSigData;
  getIsAborted: () => boolean;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function useSolSigModal(args: UseSolSigModalArgs) {
  const { getIsAborted, modalId, data } = args;
  const { closeModal, setError } = useMemoryState();

  const hostOrigin = data.payload.origin;
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

  async function onApprove() {
    try {
      if (getIsAborted()) {
        return;
      }

      if (!keyPackageHex || !apiKey || !authToken) {
        const err: MakeSigModalErrorAckPayload = {
          modal_type: "sol/make_signature",
          modal_id: modalId,
          type: "error",
          error: {
            type: "unknown_error",
            error: "Missing key package, API key, or auth token",
          },
        };
        setError(err);
        return;
      }

      setIsLoading(true);

      const keyPackageRes = teddsaKeygenFromHex(keyPackageHex);
      if (!keyPackageRes.success) {
        const err: MakeSigModalErrorAckPayload = {
          modal_type: "sol/make_signature",
          modal_id: modalId,
          type: "error",
          error: {
            type: "unknown_error",
            error: keyPackageRes.err,
          },
        };
        setError(err);
        return;
      }

      const keyPackage: KeyPackageEd25519 = {
        keyPackage: keyPackageRes.data.key_package,
        publicKeyPackage: keyPackageRes.data.public_key_package,
        identifier: keyPackageRes.data.identifier,
      };

      let message: Uint8Array;
      const signType = data.sign_type;

      if (signType === "tx") {
        // message_to_sign is base64 encoded
        message = base64ToUint8Array(data.payload.data.message_to_sign);
      } else if (signType === "message") {
        // message is hex encoded
        message = hexToUint8Array(data.payload.data.message);
      } else {
        const err: MakeSigModalErrorAckPayload = {
          modal_type: "sol/make_signature",
          modal_id: modalId,
          type: "error",
          error: {
            type: "unknown_error",
            error: "sign_all_transactions not yet supported",
          },
        };
        setError(err);
        return;
      }

      const signatureRes = await makeSignOutputEd25519(
        message,
        keyPackage,
        apiKey,
        authToken,
        getIsAborted,
      );

      if (!signatureRes.success) {
        const err: MakeSigModalErrorAckPayload = {
          modal_type: "sol/make_signature",
          modal_id: modalId,
          type: "error",
          error: signatureRes.err,
        };
        setError(err);
        return;
      }

      const signatureHex = Array.from(signatureRes.data)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const ack: OpenModalAckPayload = {
        modal_type: "sol/make_signature",
        modal_id: modalId,
        type: "approve",
        data: {
          chain_type: "sol",
          sig_result: {
            type: "signature",
            signature: signatureHex,
          },
        },
      };

      closeModal(ack);
    } catch (error: any) {
      const err: MakeSigModalErrorAckPayload = {
        modal_type: "sol/make_signature",
        modal_id: modalId,
        type: "error",
        error: {
          type: "unknown_error",
          error: error?.message || String(error),
        },
      };
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    onReject,
    onApprove,
    isLoading,
    isApproveEnabled,
    isDemo,
    theme,
    signType: data.sign_type,
  };
}
