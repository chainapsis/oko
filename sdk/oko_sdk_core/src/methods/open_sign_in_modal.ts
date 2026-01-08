import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import { renderSignInModal } from "@oko-wallet-sdk-core/ui/signin_modal";

const state = { isModalOpen: false };

export async function openSignInModal(this: OkoWalletInterface): Promise<void> {
  await this.waitUntilInitialized;

  if (state.isModalOpen) return;
  state.isModalOpen = true;

  return new Promise((resolve) => {
    const modal = renderSignInModal({
      onSelect: (provider) => this.signIn(provider),
      onClose: () => {
        state.isModalOpen = false;
        resolve();
      },
    });

    document.body.appendChild(modal.container);
  });
}
