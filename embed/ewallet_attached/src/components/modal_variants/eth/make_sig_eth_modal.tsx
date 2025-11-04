import { type FC } from "react";
import type { MakeEthereumSigData } from "@oko-wallet/oko-sdk-core";

import { MakeArbitrarySigModal } from "./arbitrary_sig/make_arbitrary_sig_modal";
import { MakeTxSigModal } from "./tx_sig/make_tx_sig_modal";
import { MakeEIP712SigModal } from "./eip712_sig/make_eip712_sig_modal";

export const MakeSignatureEthModal: FC<MakeSignatureEthModalProps> = ({
  getIsAborted,
  data,
  modalId,
}) => {
  switch (data.sign_type) {
    case "tx": {
      return (
        <MakeTxSigModal
          getIsAborted={getIsAborted}
          data={data}
          modalId={modalId}
        />
      );
    }
    case "arbitrary": {
      return (
        <MakeArbitrarySigModal
          getIsAborted={getIsAborted}
          data={data}
          modalId={modalId}
        />
      );
    }
    case "eip712": {
      return (
        <MakeEIP712SigModal
          getIsAborted={getIsAborted}
          data={data}
          modalId={modalId}
        />
      );
    }

    default: {
      throw new Error("unreachable");
    }
  }
};

export interface MakeSignatureEthModalProps {
  getIsAborted: () => boolean;
  modalId: string;
  data: MakeEthereumSigData;
}
