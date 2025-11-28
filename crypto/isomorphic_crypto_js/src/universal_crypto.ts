import { Result } from "@oko-wallet/stdlib-js";

let universalCrypto: Crypto | undefined = undefined;

function initUniversalCrypto() {
  if (
    universalCrypto === undefined &&
    typeof globalThis.crypto !== "undefined"
  ) {
    universalCrypto = globalThis.crypto;
  }
}
initUniversalCrypto();

export function getCrypto(): Result<Crypto, string> {
  if (universalCrypto !== undefined) {
    return { success: true, data: universalCrypto };
  }
  return { success: false, err: "Web Crypto API not supported" };
}
