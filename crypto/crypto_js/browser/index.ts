export function getRandomBytes(length: number): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), "=");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// export async function sha256ToBase64Url(data: string): Promise<string> {
//   const hashBuffer = await sha256(data);
//   return arrayBufferToBase64Url(hashBuffer);
// }

export async function encryptAESGCM(
  data: string,
  key: ArrayBuffer,
): Promise<{ encrypted: ArrayBuffer; iv: ArrayBuffer }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const iv = getRandomBytes(12);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    cryptoKey,
    dataBuffer,
  );

  return { encrypted, iv: iv.buffer as ArrayBuffer };
}

export async function decryptAESGCM(
  encryptedData: ArrayBuffer,
  key: ArrayBuffer,
  iv: ArrayBuffer,
): Promise<string> {
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encryptedData,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function deriveKeyPBKDF2(
  password: string,
  salt: ArrayBuffer,
  iterations: number = 100000,
  keyLength: number = 32,
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: keyLength * 8 },
    true,
    ["encrypt", "decrypt"],
  );

  return await window.crypto.subtle.exportKey("raw", derivedKey);
}
