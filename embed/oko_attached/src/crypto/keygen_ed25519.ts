import type { TeddsaKeygenOutputBytes } from "@oko-wallet/teddsa-hooks";
import type { KeyPackageRaw, PublicKeyPackageRaw } from "@oko-wallet/teddsa-interface";
import type { Result } from "@oko-wallet/stdlib-js";
import { Bytes, type Bytes32 } from "@oko-wallet/bytes";

export interface KeyPackageEd25519Hex {
  keyPackage: string;
  publicKeyPackage: string;
  identifier: string;
  publicKey: string;
}

export function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function keyPackageRawToJson(pkg: KeyPackageRaw): string {
  return JSON.stringify(pkg);
}

function publicKeyPackageRawToJson(pkg: PublicKeyPackageRaw): string {
  return JSON.stringify(pkg);
}

function jsonToKeyPackageRaw(json: string): KeyPackageRaw {
  return JSON.parse(json) as KeyPackageRaw;
}

function jsonToPublicKeyPackageRaw(json: string): PublicKeyPackageRaw {
  return JSON.parse(json) as PublicKeyPackageRaw;
}

function stringToHex(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToString(hex: string): string {
  const bytes = hexToUint8Array(hex);
  return new TextDecoder().decode(bytes);
}

export function teddsaKeygenToHex(
  keygen: TeddsaKeygenOutputBytes,
): KeyPackageEd25519Hex {
  return {
    keyPackage: stringToHex(keyPackageRawToJson(keygen.key_package)),
    publicKeyPackage: stringToHex(
      publicKeyPackageRawToJson(keygen.public_key_package),
    ),
    identifier: uint8ArrayToHex(keygen.identifier),
    publicKey: keygen.public_key.toHex(),
  };
}

export function teddsaKeygenFromHex(
  data: KeyPackageEd25519Hex,
): Result<TeddsaKeygenOutputBytes, string> {
  try {
    const publicKeyRes = Bytes.fromHexString(data.publicKey, 32);
    if (!publicKeyRes.success) {
      return { success: false, err: publicKeyRes.err };
    }

    return {
      success: true,
      data: {
        key_package: jsonToKeyPackageRaw(hexToString(data.keyPackage)),
        public_key_package: jsonToPublicKeyPackageRaw(
          hexToString(data.publicKeyPackage),
        ),
        identifier: hexToUint8Array(data.identifier),
        public_key: publicKeyRes.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      err: error instanceof Error ? error.message : String(error),
    };
  }
}

export function getPublicKeyFromKeyPackage(
  keyPackageHex: KeyPackageEd25519Hex,
): Result<Bytes32, string> {
  return Bytes.fromHexString(keyPackageHex.publicKey, 32);
}
