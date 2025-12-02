// import { Bytes, Bytes32 } from "@oko-wallet/bytes";
// import { getCrypto } from "../universal_crypto";
import type { Result } from "@oko-wallet/stdlib-js";

import type { EcdheSessionKey } from "./key_derivation";

const AES_GCM_IV_LENGTH = 12;
const AES_GCM_TAG_LENGTH = 128; // bits

export async function encryptData(
  data: Uint8Array,
  sessionKey: EcdheSessionKey,
): Promise<Result<Uint8Array, string>> {
  // const cryptoResult = getCrypto();
  // if (!cryptoResult.success) {
  //   return { success: false, err: cryptoResult.err };
  // }
  // const crypto = cryptoResult.data;

  const iv = window.crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    sessionKey.key.toArrayBuffer(),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  try {
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: AES_GCM_TAG_LENGTH,
      },
      cryptoKey,
      new Uint8Array(data),
    );

    // iv(12) + ciphertext + authTag(16)
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(ciphertext), iv.length);

    return { success: true, data: result };
  } catch (e) {
    return {
      success: false,
      err: e instanceof Error ? e.message : "Encryption failed",
    };
  }
}

export async function decryptData(
  encryptedData: Uint8Array,
  sessionKey: EcdheSessionKey,
): Promise<Result<Uint8Array, string>> {
  // const cryptoResult = getCrypto();
  // if (!cryptoResult.success) {
  //   return { success: false, err: cryptoResult.err };
  // }
  // const crypto = cryptoResult.data;

  if (encryptedData.length < AES_GCM_IV_LENGTH + 16) {
    return { success: false, err: "Encrypted data is too short" };
  }

  const iv = encryptedData.slice(0, AES_GCM_IV_LENGTH);
  const ciphertext = encryptedData.slice(AES_GCM_IV_LENGTH);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    sessionKey.key.toArrayBuffer(),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  try {
    const plaintext = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        tagLength: AES_GCM_TAG_LENGTH,
      },
      cryptoKey,
      ciphertext,
    );

    return { success: true, data: new Uint8Array(plaintext) };
  } catch (e) {
    return {
      success: false,
      err: e instanceof Error ? e.message : "Decryption failed",
    };
  }
}
