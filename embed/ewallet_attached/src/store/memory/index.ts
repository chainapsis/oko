import type {
  EWalletMsgOpenModalAck,
  OpenModalAckPayload,
} from "@oko-wallet/oko-sdk-core";
import { create } from "zustand";
import { combine } from "zustand/middleware";

import { EWALLET_SDK_TARGET } from "@oko-wallet-attached/window_msgs/target";
import type { MemoryActions, MemoryState } from "./types";
import { type AppError } from "@oko-wallet-attached/errors";

const initialState = {
  hostOrigin: null,
  modalRequest: null,
  error: null,
};

export const useMemoryState = create(
  combine<MemoryState, MemoryActions>(initialState, (set, get) => ({
    setHostOrigin: (hostOrigin: string) => {
      set({ hostOrigin });
    },
    openModal: ({ port, msg }) => {
      if (msg.msg_type !== "open_modal") {
        return;
      }

      set((_prev) => {
        return {
          modalRequest: {
            port,
            msg,
          },
        };
      });
    },
    closeModal: (payload: OpenModalAckPayload) => {
      const modalRequest = get().modalRequest;
      if (modalRequest) {
        const { port } = modalRequest;

        const ack: EWalletMsgOpenModalAck = {
          target: EWALLET_SDK_TARGET,
          msg_type: "open_modal_ack",
          payload,
        };

        port.postMessage(ack);

        set({ modalRequest: null });
      }
    },
    setError: (error: AppError) => {
      set({ error });
    },
    clearError: () => {
      set({ error: null });
    },
  })),
);
