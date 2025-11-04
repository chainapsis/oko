import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";

export function closeModal(this: OkoWalletInterface) {
  this.iframe.style.display = "none";
}
