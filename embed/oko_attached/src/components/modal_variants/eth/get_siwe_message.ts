import type { SignableMessage } from "viem";
import { parseSiweMessage, type SiweMessage } from "viem/siwe";

export function getSiweMessage(
  message: SignableMessage,
): SiweMessage | undefined {
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
