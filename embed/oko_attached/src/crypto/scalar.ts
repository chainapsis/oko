import type { Bytes32 } from "@oko-wallet/bytes";
import { Bytes } from "@oko-wallet/bytes";
import { wasmModule } from "@oko-wallet/frost-ed25519-keplr-wasm";

interface TeddsaScalarBaseMultInput {
  scalar: number[];
}

interface TeddsaScalarBaseMultOutput {
  point: number[];
}

/**
 * Compute verifying_share from signing_share.
 * Ed25519: verifying_share = signing_share * G (base point)
 *
 * Used to reconstruct KeyPackage from SSS-recovered signing_share.
 *
 * @param signingShare - 32-byte signing_share
 * @returns 32-byte verifying_share (compressed Ed25519 point)
 */
export function computeVerifyingShare(signingShare: Bytes32): Bytes32 {
  const input: TeddsaScalarBaseMultInput = {
    scalar: Array.from(signingShare.toUint8Array()),
  };

  const output: TeddsaScalarBaseMultOutput = wasmModule.scalar_base_mult(input);

  const result = Bytes.fromUint8Array(new Uint8Array(output.point), 32);
  if (!result.success) {
    throw new Error(`Invalid verifying_share output: ${result.err}`);
  }

  return result.data;
}
