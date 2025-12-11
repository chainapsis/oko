import { type FC } from "react";
import type { MakeEthereumSigData } from "@oko-wallet/oko-sdk-core";
import { parseSiweMessage, type SiweMessage } from "viem/siwe";
import type { SignableMessage } from "viem";

import { MakeArbitrarySigModal } from "./arbitrary_sig/make_arbitrary_sig_modal";
import { MakeTxSigModal } from "./tx_sig/make_tx_sig_modal";
import { MakeEIP712SigModal } from "./eip712_sig/make_eip712_sig_modal";

function getSiweMessage(message: SignableMessage): SiweMessage | undefined {
  if (typeof message !== "string") {
    return undefined;
  }
  const siweMsg = parseSiweMessage(message);

  //NOTE - If any required field in SiweMessage is empty,
  //  it is determined not to be Siwe.
  if (
    siweMsg.address &&
    siweMsg.chainId &&
    siweMsg.domain &&
    siweMsg.version &&
    siweMsg.nonce &&
    siweMsg.uri &&
    siweMsg.address.startsWith("0x")
  ) {
    return siweMsg as SiweMessage;
  }

  return undefined;
}

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
      const siweMessage = getSiweMessage(data.payload.data.message);
      const isSiweMessage = !!siweMessage;
      if (isSiweMessage) {
        return <>{siweMessage}</>;
      }

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
