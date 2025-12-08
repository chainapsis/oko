import { bytesToString, hexToString, type SignableMessage } from "viem";

export function hasOnChainSchema(signableMessage: SignableMessage): boolean {
  // Extract and decode message string from SignableMessage
  const message = extractMessageString(signableMessage);

  // Check if message is a signdoc
  if (isCosmosSignDoc(message)) {
    return true;
  }

  return false;
}

function extractMessageString(signableMessage: SignableMessage): string {
  if (typeof signableMessage === "string") {
    if (signableMessage.startsWith("0x")) {
      try {
        return hexToString(signableMessage as `0x${string}`);
      } catch {
        return signableMessage;
      }
    }
    return signableMessage;
  }

  const rawMessage = signableMessage.raw;
  if (typeof rawMessage === "string") {
    try {
      return hexToString(rawMessage);
    } catch {
      return rawMessage;
    }
  }

  return bytesToString(rawMessage);
}

/**
 * Check if message string is a Cosmos StdSignDoc format (Amino)
 * Validates both JSON structure and required fields with strict type checking
 */
function isCosmosSignDoc(message: string): boolean {
  try {
    const parsed = JSON.parse(message);

    return (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.chain_id === "string" &&
      typeof parsed.account_number === "string" &&
      typeof parsed.sequence === "string" &&
      typeof parsed.memo === "string" &&
      parsed.fee &&
      typeof parsed.fee === "object" &&
      Array.isArray(parsed.msgs)
    );
  } catch {
    return false;
  }
}
