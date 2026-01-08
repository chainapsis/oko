import { Participant } from "@oko-wallet/teddsa-interface";

import { runKeygenCentralizedEd25519, runKeygenImportEd25519 } from "../server";

export async function keygenCentralizedTest() {
  console.log("Testing centralized keygen...\n");

  // Generate new key
  const keygenOutput = runKeygenCentralizedEd25519();

  // Validate output structure
  if (
    !keygenOutput.keygen_outputs ||
    keygenOutput.keygen_outputs.length !== 2
  ) {
    throw new Error("Expected 2 keygen outputs for 2-of-2 threshold");
  }

  if (!keygenOutput.public_key || keygenOutput.public_key.length !== 32) {
    throw new Error("Expected 32-byte Ed25519 public key");
  }

  if (!keygenOutput.private_key || keygenOutput.private_key.length !== 32) {
    throw new Error("Expected 32-byte Ed25519 private key");
  }

  const clientOutput = keygenOutput.keygen_outputs[Participant.P0];
  const serverOutput = keygenOutput.keygen_outputs[Participant.P1];

  // Validate client output
  if (!clientOutput.key_package || clientOutput.key_package.length === 0) {
    throw new Error("Client key_package is empty");
  }
  if (
    !clientOutput.public_key_package ||
    clientOutput.public_key_package.length === 0
  ) {
    throw new Error("Client public_key_package is empty");
  }
  if (!clientOutput.identifier || clientOutput.identifier.length === 0) {
    throw new Error("Client identifier is empty");
  }

  // Validate server output
  if (!serverOutput.key_package || serverOutput.key_package.length === 0) {
    throw new Error("Server key_package is empty");
  }
  if (
    !serverOutput.public_key_package ||
    serverOutput.public_key_package.length === 0
  ) {
    throw new Error("Server public_key_package is empty");
  }
  if (!serverOutput.identifier || serverOutput.identifier.length === 0) {
    throw new Error("Server identifier is empty");
  }

  // Public key packages should be the same for both parties
  const clientPkgHex = Buffer.from(clientOutput.public_key_package).toString(
    "hex",
  );
  const serverPkgHex = Buffer.from(serverOutput.public_key_package).toString(
    "hex",
  );
  if (clientPkgHex !== serverPkgHex) {
    throw new Error("Public key packages should match between parties");
  }

  // Identifiers should be different
  const clientIdHex = Buffer.from(clientOutput.identifier).toString("hex");
  const serverIdHex = Buffer.from(serverOutput.identifier).toString("hex");
  if (clientIdHex === serverIdHex) {
    throw new Error("Participant identifiers should be different");
  }

  console.log("Centralized keygen validation passed!");
  console.log(
    `  Public key: ${Buffer.from(keygenOutput.public_key).toString("hex")}`,
  );
  console.log(`  Client identifier: ${clientIdHex}`);
  console.log(`  Server identifier: ${serverIdHex}`);
  console.log(`  Key package size: ${clientOutput.key_package.length} bytes`);
  console.log(
    `  Public key package size: ${clientOutput.public_key_package.length} bytes`,
  );

  return keygenOutput;
}

export async function keygenImportTest() {
  console.log("\nTesting import keygen...\n");

  // Generate a test secret key (32 bytes)
  const secretKey = new Uint8Array(32);
  for (let i = 0; i < 16; i++) {
    secretKey[i] = i + 1;
  }

  // Import the key
  const keygenOutput = runKeygenImportEd25519(secretKey);

  // Validate output structure
  if (
    !keygenOutput.keygen_outputs ||
    keygenOutput.keygen_outputs.length !== 2
  ) {
    throw new Error("Expected 2 keygen outputs for 2-of-2 threshold");
  }

  if (!keygenOutput.public_key || keygenOutput.public_key.length !== 32) {
    throw new Error("Expected 32-byte Ed25519 public key");
  }

  // The returned private key should match the input
  const returnedPrivateKey = Buffer.from(keygenOutput.private_key).toString(
    "hex",
  );
  const inputPrivateKey = Buffer.from(secretKey).toString("hex");
  if (returnedPrivateKey !== inputPrivateKey) {
    throw new Error("Returned private key should match input");
  }

  // Import same key again - should get same public key
  const keygenOutput2 = runKeygenImportEd25519(secretKey);
  const pubKey1 = Buffer.from(keygenOutput.public_key).toString("hex");
  const pubKey2 = Buffer.from(keygenOutput2.public_key).toString("hex");
  if (pubKey1 !== pubKey2) {
    throw new Error("Same secret key should produce same public key");
  }

  console.log("Import keygen validation passed!");
  console.log(`  Public key: ${pubKey1}`);
  console.log(`  Private key matches input: yes`);
  console.log(`  Deterministic: yes`);

  return keygenOutput;
}

export async function keygenCentralizedRandomnessTest() {
  console.log("\nTesting centralized keygen randomness...\n");

  // Generate multiple keys and verify they are different
  const keygen1 = runKeygenCentralizedEd25519();
  const keygen2 = runKeygenCentralizedEd25519();
  const keygen3 = runKeygenCentralizedEd25519();

  const pubKey1 = Buffer.from(keygen1.public_key).toString("hex");
  const pubKey2 = Buffer.from(keygen2.public_key).toString("hex");
  const pubKey3 = Buffer.from(keygen3.public_key).toString("hex");

  // All public keys should be different (very high probability)
  if (pubKey1 === pubKey2 || pubKey1 === pubKey3 || pubKey2 === pubKey3) {
    throw new Error(
      "Centralized keygen should produce different keys each time",
    );
  }

  console.log("Randomness test passed - all keys are different");
  return { keygen1, keygen2, keygen3 };
}

export async function keygenImportDeterministicTest() {
  console.log("\nTesting import keygen determinism...\n");

  const secretKey = new Uint8Array(32);
  for (let i = 0; i < 16; i++) {
    secretKey[i] = i + 1;
  }

  const keygen1 = runKeygenImportEd25519(secretKey);
  const keygen2 = runKeygenImportEd25519(secretKey);
  const keygen3 = runKeygenImportEd25519(secretKey);

  const pubKey1 = Buffer.from(keygen1.public_key).toString("hex");
  const pubKey2 = Buffer.from(keygen2.public_key).toString("hex");
  const pubKey3 = Buffer.from(keygen3.public_key).toString("hex");

  if (pubKey1 !== pubKey2 || pubKey2 !== pubKey3) {
    throw new Error("Import keygen public key should be deterministic");
  }

  const id1P0 = Buffer.from(
    keygen1.keygen_outputs[Participant.P0].identifier,
  ).toString("hex");
  const id2P0 = Buffer.from(
    keygen2.keygen_outputs[Participant.P0].identifier,
  ).toString("hex");
  const id1P1 = Buffer.from(
    keygen1.keygen_outputs[Participant.P1].identifier,
  ).toString("hex");
  const id2P1 = Buffer.from(
    keygen2.keygen_outputs[Participant.P1].identifier,
  ).toString("hex");

  if (id1P0.length !== id2P0.length || id1P1.length !== id2P1.length) {
    throw new Error("Identifier lengths should be consistent");
  }

  console.log("Determinism test passed - public keys are identical");
  return { keygen1, keygen2, keygen3 };
}

export async function keygenImportErrorTest() {
  console.log("\nTesting import keygen error cases...\n");

  const invalidLengths = [0, 1, 31, 33, 64];
  for (const length of invalidLengths) {
    const invalidKey = new Uint8Array(length);
    try {
      runKeygenImportEd25519(invalidKey);
      throw new Error(
        `Expected error for ${length}-byte key, but operation succeeded`,
      );
    } catch (error: any) {
      if (
        !error.message?.includes("32 bytes") &&
        !error.message?.includes("InvalidArg")
      ) {
        throw new Error(
          `Unexpected error for ${length}-byte key: ${error.message}`,
        );
      }
      console.log(`  ✓ Correctly rejected ${length}-byte key`);
    }
  }

  console.log("Error handling test passed");
}

export async function keygenImportEdgeCasesTest() {
  console.log("\nTesting import keygen edge cases...\n");

  const allZeros = new Uint8Array(32);
  try {
    const keygenZeros = runKeygenImportEd25519(allZeros);
    if (keygenZeros.public_key.length !== 32) {
      throw new Error("All-zeros key should produce valid output");
    }
    console.log("  ✓ All-zeros key handled");
  } catch (error: any) {
    if (
      error.message?.includes("Invalid secret key") ||
      error.message?.includes("scalar")
    ) {
      console.log("  ✓ All-zeros key correctly rejected (invalid scalar)");
    } else {
      throw error;
    }
  }

  const allOnes = new Uint8Array(32);
  allOnes.fill(0xff);
  try {
    const keygenOnes = runKeygenImportEd25519(allOnes);
    if (keygenOnes.public_key.length !== 32) {
      throw new Error("All-ones key should produce valid output");
    }
    console.log("  ✓ All-ones key handled");
  } catch (error: any) {
    if (
      error.message?.includes("Invalid secret key") ||
      error.message?.includes("scalar")
    ) {
      console.log("  ✓ All-ones key correctly rejected (invalid scalar)");
    } else {
      throw error;
    }
  }

  const alternating = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    alternating[i] = i % 2 === 0 ? 0xaa : 0x55;
  }
  try {
    const keygenAlt = runKeygenImportEd25519(alternating);
    if (keygenAlt.public_key.length !== 32) {
      throw new Error("Alternating pattern key should produce valid output");
    }
    console.log("  ✓ Alternating pattern key handled");
  } catch (error: any) {
    if (
      error.message?.includes("Invalid secret key") ||
      error.message?.includes("scalar")
    ) {
      console.log(
        "  ✓ Alternating pattern key correctly rejected (invalid scalar)",
      );
    } else {
      throw error;
    }
  }

  const validKey = new Uint8Array(32);
  for (let i = 0; i < 16; i++) {
    validKey[i] = i + 1;
  }
  const keygenValid = runKeygenImportEd25519(validKey);
  if (keygenValid.public_key.length !== 32) {
    throw new Error("Valid key pattern should produce valid output");
  }
  console.log("  ✓ Valid key pattern handled");

  console.log("Edge cases test passed");
}

export async function keygenCentralizedConsistencyTest() {
  console.log("\nTesting centralized keygen consistency...\n");

  const keygen = runKeygenCentralizedEd25519();

  const privateKeyHex = Buffer.from(keygen.private_key).toString("hex");
  const expectedZeros = "0".repeat(64);
  if (privateKeyHex !== expectedZeros) {
    throw new Error(
      `Centralized keygen private_key should be all zeros, got: ${privateKeyHex}`,
    );
  }
  console.log("  ✓ Private key is correctly set to zeros");

  const clientKeyPackage = Buffer.from(
    keygen.keygen_outputs[Participant.P0].key_package,
  ).toString("hex");
  const serverKeyPackage = Buffer.from(
    keygen.keygen_outputs[Participant.P1].key_package,
  ).toString("hex");
  if (clientKeyPackage === serverKeyPackage) {
    throw new Error("Key packages should be different between participants");
  }
  console.log("  ✓ Key packages are different between participants");

  const keygen2 = runKeygenCentralizedEd25519();
  const id1P0 = Buffer.from(
    keygen.keygen_outputs[Participant.P0].identifier,
  ).toString("hex");
  const id2P0 = Buffer.from(
    keygen2.keygen_outputs[Participant.P0].identifier,
  ).toString("hex");
  const id1P1 = Buffer.from(
    keygen.keygen_outputs[Participant.P1].identifier,
  ).toString("hex");
  const id2P1 = Buffer.from(
    keygen2.keygen_outputs[Participant.P1].identifier,
  ).toString("hex");

  if (id1P0 === id1P1) {
    throw new Error("P0 and P1 identifiers should be different");
  }
  if (id1P0.length !== id2P0.length || id1P1.length !== id2P1.length) {
    throw new Error("Identifier lengths should be consistent");
  }
  console.log("  ✓ Identifiers are consistent");

  console.log("Consistency test passed");
}

// Run the tests
async function main() {
  console.log("Starting Ed25519 keygen tests...\n");
  console.log("=".repeat(50));

  try {
    await keygenCentralizedTest();
    await keygenImportTest();
    await keygenCentralizedRandomnessTest();
    await keygenImportDeterministicTest();
    await keygenImportErrorTest();
    await keygenImportEdgeCasesTest();
    await keygenCentralizedConsistencyTest();

    console.log("\n" + "=".repeat(50));
    console.log("All keygen tests passed!");
  } catch (error) {
    console.error("\nTest failed:", error);
    process.exit(1);
  }
}

main();
