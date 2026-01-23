import { Bech32Address } from "@keplr-wallet/cosmos";
import type { MsgSend as ThorMsgSend } from "@keplr-wallet/proto-types/thorchain/v1/types/msg_send";
import type { Msg } from "@keplr-wallet/types";
import type { FC, ReactNode } from "react";

import { SendMessagePretty } from "./send/send";
import { UnknownMessage } from "./unknown/unknown";
import { CollapsibleList } from "@oko-wallet-attached/components/modal_variants/common/transaction_summary";
import type {
  SendMsg,
  UnpackedMsgForView,
} from "@oko-wallet-attached/types/cosmos_msg";

function getMessageKey(msg: Msg | UnpackedMsgForView, index: number): string {
  if ("type" in msg) {
    return `${msg.type}-${index}`;
  }
  if ("typeUrl" in msg) {
    return `${msg.typeUrl}-${index}`;
  }
  return `unknown-${index}`;
}

function getMessageTitle(msg: Msg | UnpackedMsgForView): string {
  if ("type" in msg) {
    // Amino message: "cosmos-sdk/MsgSend" -> "Send"
    const parts = msg.type.split("/");
    const msgType = parts[parts.length - 1];
    if (msgType.startsWith("Msg")) {
      return msgType.slice(3);
    }
    return msgType;
  }

  if ("typeUrl" in msg) {
    // Proto message: "/cosmos.bank.v1beta1.MsgSend" -> "Send"
    const parts = msg.typeUrl.split(".");
    const msgType = parts[parts.length - 1];
    if (msgType.startsWith("Msg")) {
      return msgType.slice(3);
    }
    return msgType;
  }

  return "Unknown";
}

function renderAminoMessageContent(chainId: string, msg: Msg): ReactNode {
  switch (msg.type) {
    case "cosmos-sdk/MsgSend":
    case "thorchain/MsgSend":
      return (
        <SendMessagePretty
          chainId={chainId}
          amount={msg.value.amount}
          toAddress={msg.value.to_address}
        />
      );
    default:
      return <UnknownMessage chainId={chainId} msg={msg} />;
  }
}

export function renderProtoMessageContent(
  chainId: string,
  msg: UnpackedMsgForView,
): ReactNode {
  switch (msg.typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend": {
      const unpacked = msg.unpacked as SendMsg;
      return (
        <SendMessagePretty
          chainId={chainId}
          amount={unpacked.amount}
          toAddress={unpacked.to_address}
        />
      );
    }

    case "/types.MsgSend":
      return (
        <SendMessagePretty
          chainId={chainId}
          amount={(msg.unpacked as ThorMsgSend).amount}
          toAddress={new Bech32Address(
            (msg.unpacked as ThorMsgSend).toAddress,
          ).toBech32("thor")}
        />
      );

    default:
      return <UnknownMessage chainId={chainId} msg={msg} />;
  }
}

function renderMessageContent(
  chainId: string,
  msg: Msg | UnpackedMsgForView,
): ReactNode {
  if ("type" in msg) {
    return renderAminoMessageContent(chainId, msg);
  }

  if ("unpacked" in msg) {
    return renderProtoMessageContent(chainId, msg);
  }

  return null;
}

export interface MessagesProps {
  chainId: string;
  messages: readonly (Msg | UnpackedMsgForView)[];
  isLoading?: boolean;
}

export const Messages: FC<MessagesProps> = ({
  chainId,
  messages,
  isLoading,
}) => {
  return (
    <CollapsibleList
      items={messages as (Msg | UnpackedMsgForView)[]}
      getKey={getMessageKey}
      getTitle={getMessageTitle}
      renderContent={(msg) => renderMessageContent(chainId, msg)}
      isLoading={isLoading}
    />
  );
};
