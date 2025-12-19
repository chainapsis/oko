import { Bytes } from "@oko-wallet/bytes";
import type { TeddsaKeygenOutputBytes } from "@oko-wallet/teddsa-hooks-mock/src/types";
import type { Result } from "@oko-wallet/stdlib-js";

/**
 * Convert hex string to Uint8Array.
 */
export function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, "hex"));
}

/**
 * Convert TEdDSA keygen output to hex strings for API transmission.
 */
export function teddsaKeygenToHex(keygen: TeddsaKeygenOutputBytes): {
  key_package: string;
  public_key_package: string;
  identifier: string;
  public_key: string;
} {
  return {
    key_package: Buffer.from(keygen.key_package).toString("hex"),
    public_key_package: Buffer.from(keygen.public_key_package).toString("hex"),
    identifier: Buffer.from(keygen.identifier).toString("hex"),
    public_key: keygen.public_key.toHex(),
  };
}

/**
 * Convert hex strings back to TEdDSA keygen output.
 */
export function teddsaKeygenFromHex(data: {
  key_package: string;
  public_key_package: string;
  identifier: string;
  public_key: string;
}): Result<TeddsaKeygenOutputBytes, string> {
  const publicKeyRes = Bytes.fromHexString(data.public_key, 32);
  if (publicKeyRes.success === false) {
    return { success: false, err: publicKeyRes.err };
  }

  return {
    success: true,
    data: {
      key_package: Buffer.from(data.key_package, "hex"),
      public_key_package: Buffer.from(data.public_key_package, "hex"),
      identifier: Buffer.from(data.identifier, "hex"),
      public_key: publicKeyRes.data,
    },
  };
}
