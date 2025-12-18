import { wasmModule } from "@oko-wallet/teddsa-wasm";
import { Bytes } from "@oko-wallet/bytes";
import type { Bytes32 } from "@oko-wallet/bytes";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  TeddsaKeygenResult,
  TeddsaKeygenOutputBytes,
  TeddsaCentralizedKeygenOutput,
} from "./types";

/**
 * Import an existing Ed25519 secret key and split it into threshold shares.
 *
 * @param secretKey - 32-byte Ed25519 secret key
 * @returns Result containing keygen shares for both participants
 */
export async function importExternalSecretKeyEd25519(
  secretKey: Bytes32,
): Promise<Result<TeddsaKeygenResult, string>> {
  try {
    const keygenOutput: TeddsaCentralizedKeygenOutput =
      wasmModule.cli_keygen_import_ed25519([...secretKey.toUint8Array()]);

    return processKeygenOutput(keygenOutput);
  } catch (error: any) {
    return {
      success: false,
      err: String(error),
    };
  }
}

/**
 * Generate a new 2-of-2 threshold Ed25519 key using centralized key generation.
 *
 * @returns Result containing keygen shares for both participants
 */
export async function runTeddsaKeygen(): Promise<
  Result<TeddsaKeygenResult, string>
> {
  try {
    const keygenOutput: TeddsaCentralizedKeygenOutput =
      wasmModule.cli_keygen_centralized_ed25519();

    return processKeygenOutput(keygenOutput);
  } catch (error: any) {
    return {
      success: false,
      err: String(error),
    };
  }
}

/**
 * Process raw WASM keygen output into typed result
 */
function processKeygenOutput(
  keygenOutput: TeddsaCentralizedKeygenOutput,
): Result<TeddsaKeygenResult, string> {
  const [keygen_1_raw, keygen_2_raw] = keygenOutput.keygen_outputs;

  // Convert public key to Bytes32
  const publicKeyBytesRes = Bytes.fromUint8Array(
    new Uint8Array(keygenOutput.public_key),
    32,
  );
  if (publicKeyBytesRes.success === false) {
    return {
      success: false,
      err: publicKeyBytesRes.err,
    };
  }

  const keygen_1: TeddsaKeygenOutputBytes = {
    key_package: new Uint8Array(keygen_1_raw.key_package),
    public_key_package: new Uint8Array(keygen_1_raw.public_key_package),
    identifier: new Uint8Array(keygen_1_raw.identifier),
    public_key: publicKeyBytesRes.data,
  };

  const keygen_2: TeddsaKeygenOutputBytes = {
    key_package: new Uint8Array(keygen_2_raw.key_package),
    public_key_package: new Uint8Array(keygen_2_raw.public_key_package),
    identifier: new Uint8Array(keygen_2_raw.identifier),
    public_key: publicKeyBytesRes.data, // Same public key for both participants
  };

  return {
    success: true,
    data: { keygen_1, keygen_2 },
  };
}
