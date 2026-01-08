import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import type { SignInType } from "@oko-wallet-sdk-core/types/oauth";
import {
  renderLoginModal,
  removeLoginModal,
  type LoginModalController,
} from "@oko-wallet-sdk-core/ui/login_modal";

interface ModalState {
  current: LoginModalController | null;
}

interface LoginState {
  controller: LoginModalController | null;
  resolved: boolean;
}

// Prevent multiple modals from being opened simultaneously
const modalState: ModalState = { current: null };

export async function openSignInModal(this: OkoWalletInterface): Promise<void> {
  await this.waitUntilInitialized;

  // If modal is already open, return early
  if (modalState.current) {
    return;
  }

  return new Promise((resolve, reject) => {
    const state: LoginState = {
      controller: null,
      resolved: false,
    };

    const cleanup = () => {
      if (state.controller) {
        removeLoginModal(state.controller.container);
        state.controller = null;
        modalState.current = null;
      }
    };

    const handleClose = () => {
      cleanup();
      if (!state.resolved) {
        state.resolved = true;
        resolve();
      }
    };

    const handleSelect = async (provider: SignInType) => {
      state.controller?.showLoading(provider);

      try {
        await this.signIn(provider);
        cleanup();
        state.resolved = true;
        resolve();
      } catch (error) {
        state.controller?.showFailed(provider);
      }
    };

    state.controller = renderLoginModal({
      onSelect: handleSelect,
      onClose: handleClose,
    });
    modalState.current = state.controller;

    document.body.appendChild(state.controller.container);
  });
}
