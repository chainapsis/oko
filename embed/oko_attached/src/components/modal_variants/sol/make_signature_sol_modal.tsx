import type { FC } from "react";

import type { MakeSolanaSigData } from "@oko-wallet/oko-sdk-core";

import { MakeAllTxSigModal } from "./all_tx_sig/make_all_tx_sig_modal";
import { MakeMessageSigModal } from "./message_sig/make_message_sig_modal";
import { MakeTxSigModal } from "./tx_sig/make_tx_sig_modal";

export interface MakeSignatureSolModalProps {
  getIsAborted: () => boolean;
  modalId: string;
  data: MakeSolanaSigData;
}

export const MakeSignatureSolModal: FC<MakeSignatureSolModalProps> = ({
  getIsAborted,
  data,
  modalId,
}) => {
  switch (data.sign_type) {
    case "tx": {
      return (
        <MakeTxSigModal
          data={data}
          modalId={modalId}
          getIsAborted={getIsAborted}
        />
      );
    }
    case "all_tx": {
      return (
        <MakeAllTxSigModal
          data={data}
          modalId={modalId}
          getIsAborted={getIsAborted}
        />
      );
    }
    case "message": {
      return (
        <MakeMessageSigModal
          data={data}
          modalId={modalId}
          getIsAborted={getIsAborted}
        />
      );
    }
  }
};
