import type { OkoWalletMsgOpenModal } from "@oko-wallet/oko-sdk-core";
import { useMemoryState } from "@oko-wallet-attached/store/memory";

import type { MsgEventContext } from "./types";

export async function handleOpenModal(
  ctx: MsgEventContext,
  msg: OkoWalletMsgOpenModal,
) {
  const { port } = ctx;

  useMemoryState.getState().clearError();
  useMemoryState.getState().openModal({ port, msg });
}
