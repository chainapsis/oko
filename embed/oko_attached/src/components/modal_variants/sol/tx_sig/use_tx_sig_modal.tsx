import type { MakeSolTxSignData } from "@oko-wallet/oko-sdk-core";
import { base64ToUint8Array } from "@oko-wallet-attached/utils/base64";
import {
  useSolSignatureBase,
  signMessageToHex,
} from "../use_sol_signature_base";

export interface UseTxSigModalArgs {
  modalId: string;
  data: MakeSolTxSignData;
  getIsAborted: () => boolean;
}

export function useTxSigModal(args: UseTxSigModalArgs) {
  const { modalId, data, getIsAborted } = args;
  const hostOrigin = data.payload.origin;

  const base = useSolSignatureBase({ modalId, hostOrigin, getIsAborted });

  async function onApprove() {
    if (getIsAborted()) return;

    const ctx = base.prepareSigningContext();
    if (!ctx) return;

    base.setIsLoading(true);

    try {
      const message = base64ToUint8Array(data.payload.data.message_to_sign);
      const result = await signMessageToHex(message, ctx);

      if (!result.success) {
        base.emitError(result.error);
        return;
      }

      base.closeWithSignature(result.signature);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      base.emitUnknownError(errorMessage);
    } finally {
      base.setIsLoading(false);
    }
  }

  return {
    onReject: base.onReject,
    onApprove,
    isLoading: base.isLoading,
    isApproveEnabled: base.isApproveEnabled,
    isDemo: base.isDemo,
    theme: base.theme,
    data,
  };
}
