import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import type { SignInType } from "@oko-wallet-sdk-core/types/oauth";
import {
  renderLoginModal,
  removeLoginModal,
  type LoginModalController,
} from "@oko-wallet-sdk-core/ui/login_modal";

// Prevent multiple modals from being opened simultaneously
let activeModalController: LoginModalController | null = null;

export async function login(this: OkoWalletInterface): Promise<void> {
  await this.waitUntilInitialized;

  // If modal is already open, return early
  if (activeModalController) {
    return;
  }

  return new Promise((resolve, reject) => {
    let modalController: LoginModalController | null = null;
    let isResolved = false;

    const cleanup = () => {
      if (modalController) {
        removeLoginModal(modalController.container);
        modalController = null;
        activeModalController = null;
      }
    };

    const handleClose = () => {
      cleanup();
      if (!isResolved) {
        isResolved = true;
        resolve();
      }
    };

    const handleSelect = async (provider: SignInType) => {
      // CRITICAL: Call signIn synchronously within the click event context
      // This ensures Safari allows the popup to open
      modalController?.hideError();

      try {
        await this.signIn(provider);
        cleanup();
        isResolved = true;
        resolve();
      } catch (error) {
        // Show error message instead of closing the modal
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        modalController?.showError(errorMessage);
      }
    };

    modalController = renderLoginModal({
      onSelect: handleSelect,
      onClose: handleClose,
    });
    activeModalController = modalController;

    document.body.appendChild(modalController.container);
  });
}
