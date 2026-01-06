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
  for (let i = 0; i < 32; i++) {
    secretKey[i] = i;
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

// Run the tests
async function main() {
  console.log("Starting Ed25519 keygen tests...\n");
  console.log("=".repeat(50));

  try {
    await keygenCentralizedTest();
    await keygenImportTest();

    console.log("\n" + "=".repeat(50));
    console.log("All keygen tests passed!");
  } catch (error) {
    console.error("\nTest failed:", error);
    process.exit(1);
  }
}

main();
