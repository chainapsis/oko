import type { UnpackedMsgForView } from "@oko-wallet-attached/types/cosmos_msg";

export async function convertProtoToRawJsonMsg(
  originalMsgs: UnpackedMsgForView[],
  messages: any[],
): Promise<UnpackedMsgForView[]> {
  try {
    return messages.map((msg: any) => {
      const originalMsg = originalMsgs.find(
        (m) => m.typeUrl === msg["@type"],
      ) as {
        typeUrl: string;
        value: string;
      };

      const unpackedWithoutType = Object.fromEntries(
        Object.entries(msg).filter(([key]) => key !== "@type"),
      );

      return {
        typeUrl: msg["@type"],
        value: originalMsg.value,
        unpacked: { ...unpackedWithoutType },
      };
    });
  } catch (error) {
    console.error(error);
    return messages;
  }
}
