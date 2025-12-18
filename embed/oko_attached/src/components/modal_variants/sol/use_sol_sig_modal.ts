import { useState } from "react";
import type { MakeSolanaSigData, OpenModalAckPayload } from "@oko-wallet/oko-sdk-core";

import { useAppState } from "@oko-wallet-attached/store/app";
import { useMemoryState } from "@oko-wallet-attached/store/memory";
import { makeSignOutputEd25519 } from "@oko-wallet-attached/crypto/sign_ed25519";
import { hexToUint8Array } from "@oko-wallet-attached/crypto/keygen_ed25519";

export function useSolSigModal(args: UseSolSigModalArgs) {
  const { data, modalId, getIsAborted } = args;
  const { closeModal, setError } = useMemoryState();
  const appState = useAppState();

  const hostOrigin = data.payload.origin;
  const theme = appState.getTheme(hostOrigin);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

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

      setIsLoading(true);
      setLocalError(null);

      // Get keygen data from storage
      const keyPackageEd25519 = appState.getKeyPackageEd25519(hostOrigin);
      if (!keyPackageEd25519) {
        throw new Error("Ed25519 key package not found in local storage");
      }

      const authToken = appState.getAuthToken(hostOrigin);
      if (!authToken) {
        throw new Error("Auth token not found");
      }

      const wallet = appState.getWallet(hostOrigin);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Prepare message to sign based on sign_type
      let messageToSign: Uint8Array;

      switch (data.sign_type) {
        case "tx": {
          // For transactions, we sign the message bytes (not the full serialized tx)
          // The SDK provides message_to_sign which is the transaction message
          const txData = data.payload.data as { message_to_sign: string };
          messageToSign = new Uint8Array(Buffer.from(txData.message_to_sign, "base64"));
          break;
        }
        case "message": {
          // For arbitrary messages, sign the hex-encoded message
          const messageHex = data.payload.data.message;
          messageToSign = hexToUint8Array(messageHex);
          break;
        }
        case "all_tx": {
          // For multiple transactions, we'll sign them one by one
          // For now, throw an error - this needs more complex handling
          throw new Error("sign_all_transactions not yet implemented");
        }
        default: {
          throw new Error(`Unknown sign type: ${(data as any).sign_type}`);
        }
      }

      // Convert hex key packages to Uint8Array format for signing
      const keygen1 = {
        key_package: hexToUint8Array(keyPackageEd25519.keyPackage),
        public_key_package: hexToUint8Array(keyPackageEd25519.publicKeyPackage),
        identifier: new Uint8Array([1]), // Client is always participant 1
        public_key: { toUint8Array: () => new Uint8Array(32) } as any, // Not used in signing
      };

      // Perform the signature
      const signResult = await makeSignOutputEd25519(
        messageToSign,
        keygen1,
        "", // apiKey not used in current implementation
        authToken,
        wallet.walletId,
        getIsAborted,
      );

      if (!signResult.success) {
        throw new Error(`Signing failed: ${signResult.err.type} - ${signResult.err.error || ""}`);
      }

      // Convert signature to hex string
      const signatureHex = Buffer.from(signResult.data.signature).toString("hex");

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
      console.error("[sol/make_signature] Error signing:", error);
      setLocalError(error.message || "Unknown error during signing");

      // Optionally close modal with error
      // const ack: OpenModalAckPayload = {
      //   modal_type: "sol/make_signature",
      //   modal_id: modalId,
      //   type: "error",
      //   error: { type: "unknown_error", error: error.message },
      // };
      // closeModal(ack);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    onReject,
    onApprove,
    isLoading,
    theme,
    error,
  };
}

export interface UseSolSigModalArgs {
  modalId: string;
  data: MakeSolanaSigData;
  getIsAborted: () => boolean;
}
