import { describe, it, expect, beforeAll } from "@jest/globals";

import { initWasmForTest, wasmModule } from "./wasm-helper";
import type { CentralizedKeygenOutput } from "../keygen";

function toArray(obj: number[] | Record<number, number>): number[] {
  if (Array.isArray(obj)) {
    return obj;
  }
  const result: number[] = [];
  for (let i = 0; i < 32; i++) {
    result.push(obj[i] ?? 0);
  }
  return result;
}

describe("WASM byte size validation", () => {
  beforeAll(async () => {
    await initWasmForTest();
  });

  describe("keygen output sizes", () => {
    it("Identifier should be exactly 32 bytes", () => {
      const keygen: CentralizedKeygenOutput =
        wasmModule.cli_keygen_centralized_ed25519();
      const keyPackage = keygen.keygen_outputs[0];

      expect(toArray(keyPackage.identifier).length).toBe(32);
    });

    it("signing_share should be exactly 32 bytes", () => {
      const keygen: CentralizedKeygenOutput =
        wasmModule.cli_keygen_centralized_ed25519();
      const keyPackage = keygen.keygen_outputs[0];

      expect(toArray(keyPackage.signing_share).length).toBe(32);
    });

    it("verifying_share should be exactly 32 bytes", () => {
      const keygen: CentralizedKeygenOutput =
        wasmModule.cli_keygen_centralized_ed25519();
      const keyPackage = keygen.keygen_outputs[0];

      expect(toArray(keyPackage.verifying_share).length).toBe(32);
    });

    it("verifying_key should be exactly 32 bytes", () => {
      const keygen: CentralizedKeygenOutput =
        wasmModule.cli_keygen_centralized_ed25519();
      const keyPackage = keygen.keygen_outputs[0];

      expect(toArray(keyPackage.verifying_key).length).toBe(32);
    });

    it("PublicKeyPackage.verifying_key should be exactly 32 bytes", () => {
      const keygen: CentralizedKeygenOutput =
        wasmModule.cli_keygen_centralized_ed25519();
      const publicKeyPackage = keygen.public_key_package;

      expect(toArray(publicKeyPackage.verifying_key).length).toBe(32);
    });

    it("PublicKeyPackage.verifying_shares values should be exactly 32 bytes each", () => {
      const keygen: CentralizedKeygenOutput =
        wasmModule.cli_keygen_centralized_ed25519();
      const publicKeyPackage = keygen.public_key_package;

      for (const [_key, value] of Object.entries(
        publicKeyPackage.verifying_shares,
      )) {
        expect(toArray(value).length).toBe(32);
      }
    });
  });

  // TODO: add tests for sign round1/round2 @chemonoworld
  // - frost_ed25519_keplr/tests/serialization_tests.rs
  // - frost_ed25519_keplr/tests/snapshots/serialization_tests__check_signing_nonces_postcard_serialization.snap
  // - frost_ed25519_keplr/tests/snapshots/serialization_tests__check_signing_commitments_postcard_serialization.snap
});
