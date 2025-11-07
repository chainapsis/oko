import { sha256 as nobleSHA256 } from "@noble/hashes/sha2";

export function sha256(data: string | ArrayBuffer): Uint8Array {
  const encoder = new TextEncoder();
  const dataBuffer =
    typeof data === "string" ? encoder.encode(data) : new Uint8Array(data);
  return nobleSHA256(dataBuffer);
}
