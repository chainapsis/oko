import type { SignableMessage } from "viem";
import { parseSiweMessage, type SiweMessage } from "viem/siwe";

const ALLOW_PROTOCOLS = ["https:"];
const BYPASS_HOSTS = ["localhost"];

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

export function verifySiweMessage(
  message: SiweMessage,
  origin: string,
): boolean {
  try {
    const {
      origin: originByPayload,
      protocol: protocolByPayload,
      host: hostByPayload,
    } = new URL(origin);
    const { origin: originByTxUri, protocol: protocolByTxUri } = new URL(
      message.uri,
    );

    if (originByPayload !== originByTxUri || hostByPayload !== message.domain) {
      return false;
    }

    // If scheme is not HTTPS, return false (when hostname is not localhost)
    if (
      !BYPASS_HOSTS.includes(hostByPayload.split(":")[0]) &&
      (!ALLOW_PROTOCOLS.includes(protocolByPayload) ||
        !ALLOW_PROTOCOLS.includes(protocolByTxUri))
    ) {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
}
