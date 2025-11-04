import type {
  OkoWalletMsgOpenModal,
  OpenModalAckPayload,
} from "@oko-wallet/oko-sdk-core";

import type { AppError } from "@oko-wallet-attached/errors";

export interface ModalRequest {
  port: MessagePort;
  msg: OkoWalletMsgOpenModal;
}

export interface MemoryState {
  hostOrigin: string | null;
  modalRequest: ModalRequest | null;
  error: AppError | null;
}

export interface MemoryActions {
  setHostOrigin: (hostOrigin: string) => void;
  openModal: (req: ModalRequest) => void;
  closeModal: (payload: OpenModalAckPayload) => void;
  setError: (error: AppError) => void;
  clearError: () => void;
}
