import type { EWalletMsgOpenModal } from "@oko-wallet/oko-sdk-core";

import type { MsgEventContext } from "./types";
import { useMemoryState } from "@oko-wallet-attached/store/memory";

export async function handleOpenModal(
  ctx: MsgEventContext,
  msg: EWalletMsgOpenModal,
) {
  const { port } = ctx;

  useMemoryState.getState().clearError();
  useMemoryState.getState().openModal({ port, msg });
}
