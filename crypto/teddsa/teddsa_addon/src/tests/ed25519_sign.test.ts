import { Participant } from "@oko-wallet/teddsa-interface";
import type {
  CommitmentEntry,
  SignatureShareEntry,
} from "@oko-wallet/teddsa-interface";

import {
  runKeygenCentralizedEd25519,
  runSignRound1Ed25519,
  runSignRound2Ed25519,
  runAggregateEd25519,
  runVerifyEd25519,
  type NapiCentralizedKeygenOutput,
  type NapiSigningCommitmentOutput,
} from "../server";

interface TeddsaClientState {
  keygenOutput?: NapiCentralizedKeygenOutput;
  round1Output?: NapiSigningCommitmentOutput;
}

interface TeddsaServerState {
  keygenOutput?: NapiCentralizedKeygenOutput;
  round1Output?: NapiSigningCommitmentOutput;
}

function makeClientState(): TeddsaClientState {
  return {};
}

function makeServerState(): TeddsaServerState {
  return {};
}

// ============================================================================
// Integration Tests
// ============================================================================

export async function signTestEd25519(
  clientState: TeddsaClientState,
  serverState: TeddsaServerState,
) {
  // 1. Centralized keygen - generates key shares for both parties
  const keygenOutput = runKeygenCentralizedEd25519();
  const clientKeygenOutput = keygenOutput.keygen_outputs[Participant.P0];
  const serverKeygenOutput = keygenOutput.keygen_outputs[Participant.P1];

  console.log(
    `Keygen success. Public key length: ${keygenOutput.public_key.length} bytes`,
  );

  // Store key packages
  clientState.keygenOutput = keygenOutput;
  serverState.keygenOutput = keygenOutput;

  // Test message to sign
  const message = new TextEncoder().encode("Hello, Solana!");

  // 2. Round 1 - Both parties generate nonces and commitments
  const clientRound1 = runSignRound1Ed25519(
    new Uint8Array(clientKeygenOutput.key_package),
  );
  const serverRound1 = runSignRound1Ed25519(
    new Uint8Array(serverKeygenOutput.key_package),
  );

  console.log("Round 1 complete - nonces and commitments generated");

  // Collect all commitments
  const allCommitments: CommitmentEntry[] = [
    {
      identifier: clientRound1.identifier,
      commitments: clientRound1.commitments,
    },
    {
      identifier: serverRound1.identifier,
      commitments: serverRound1.commitments,
    },
  ];

  // 3. Round 2 - Both parties generate signature shares
  const clientRound2 = runSignRound2Ed25519(
    message,
    new Uint8Array(clientKeygenOutput.key_package),
    new Uint8Array(clientRound1.nonces),
    allCommitments,
  );
  const serverRound2 = runSignRound2Ed25519(
    message,
    new Uint8Array(serverKeygenOutput.key_package),
    new Uint8Array(serverRound1.nonces),
    allCommitments,
  );

  console.log("Round 2 complete - signature shares generated");

  // Collect all signature shares
  const allSignatureShares: SignatureShareEntry[] = [
    {
      identifier: clientRound2.identifier,
      signature_share: clientRound2.signature_share,
    },
    {
      identifier: serverRound2.identifier,
      signature_share: serverRound2.signature_share,
    },
  ];

  // 4. Aggregate - Combine signature shares into final signature
  const aggregateOutput = runAggregateEd25519(
    message,
    allCommitments,
    allSignatureShares,
    new Uint8Array(clientKeygenOutput.public_key_package),
  );

  console.log(
    `Aggregate success. Signature length: ${aggregateOutput.signature.length} bytes`,
  );

  if (aggregateOutput.signature.length !== 64) {
    throw new Error(
      `Invalid signature length: expected 64, got ${aggregateOutput.signature.length}`,
    );
  }

  // 5. Verify - Check that the signature is valid
  const isValid = runVerifyEd25519(
    message,
    new Uint8Array(aggregateOutput.signature),
    new Uint8Array(clientKeygenOutput.public_key_package),
  );

  if (isValid) {
    console.log("Verification SUCCESS - signature is valid");
  } else {
    throw new Error("Verification FAILED - signature is invalid");
  }

  // Verify with wrong message should fail
  const wrongMessage = new TextEncoder().encode("Wrong message!");
  const isValidWrong = runVerifyEd25519(
    wrongMessage,
    new Uint8Array(aggregateOutput.signature),
    new Uint8Array(clientKeygenOutput.public_key_package),
  );

  if (!isValidWrong) {
    console.log("Negative test passed - wrong message correctly rejected");
  } else {
    throw new Error(
      "Negative test FAILED - wrong message was incorrectly accepted",
    );
  }

  return {
    signature: aggregateOutput.signature,
    publicKey: keygenOutput.public_key,
  };
}

// ============================================================================
// Round 1 Tests
// ============================================================================

async function signRound1BasicTest() {
  console.log("\nTesting sign round1 basic functionality...\n");

  const keygenOutput = runKeygenCentralizedEd25519();
  const clientKeyPackage = new Uint8Array(
    keygenOutput.keygen_outputs[Participant.P0].key_package,
  );

  const round1Output = runSignRound1Ed25519(clientKeyPackage);

  if (!round1Output.nonces || round1Output.nonces.length === 0) {
    throw new Error("Nonces should not be empty");
  }
  if (!round1Output.commitments || round1Output.commitments.length === 0) {
    throw new Error("Commitments should not be empty");
  }
  if (!round1Output.identifier || round1Output.identifier.length === 0) {
    throw new Error("Identifier should not be empty");
  }

  const keygenIdentifier = Buffer.from(
    keygenOutput.keygen_outputs[Participant.P0].identifier,
  ).toString("hex");
  const round1Identifier = Buffer.from(round1Output.identifier).toString("hex");

  if (keygenIdentifier !== round1Identifier) {
    throw new Error("Round1 identifier should match key_package identifier");
  }

  console.log("  ✓ Basic functionality test passed");
  return round1Output;
}

async function signRound1ErrorTest() {
  console.log("\nTesting sign round1 error cases...\n");

  const invalidInputs = [
    { name: "empty array", input: new Uint8Array(0) },
    { name: "single byte", input: new Uint8Array([0x00]) },
    { name: "invalid format", input: new Uint8Array(100).fill(0xff) },
  ];

  for (const { name, input } of invalidInputs) {
    try {
      runSignRound1Ed25519(input);
      throw new Error(`Expected error for ${name}, but operation succeeded`);
    } catch (error: any) {
      if (
        !error.message?.includes("sign_round1") &&
        !error.message?.includes("deserialize") &&
        !error.message?.includes("error")
      ) {
        throw new Error(`Unexpected error for ${name}: ${error.message}`);
      }
      console.log(`  ✓ Correctly rejected ${name}`);
    }
  }

  console.log("Error handling test passed");
}

async function signRound1OutputFormatTest() {
  console.log("\nTesting sign round1 output format...\n");

  const keygenOutput = runKeygenCentralizedEd25519();
  const clientKeyPackage = new Uint8Array(
    keygenOutput.keygen_outputs[Participant.P0].key_package,
  );

  const round1Output = runSignRound1Ed25519(clientKeyPackage);

  if (!Array.isArray(round1Output.nonces)) {
    throw new Error("Nonces should be an array");
  }
  if (!Array.isArray(round1Output.commitments)) {
    throw new Error("Commitments should be an array");
  }
  if (!Array.isArray(round1Output.identifier)) {
    throw new Error("Identifier should be an array");
  }

  if (round1Output.nonces.length === 0) {
    throw new Error("Nonces array should not be empty");
  }
  if (round1Output.commitments.length === 0) {
    throw new Error("Commitments array should not be empty");
  }
  if (round1Output.identifier.length === 0) {
    throw new Error("Identifier array should not be empty");
  }

  console.log(`  ✓ Nonces length: ${round1Output.nonces.length} bytes`);
  console.log(
    `  ✓ Commitments length: ${round1Output.commitments.length} bytes`,
  );
  console.log(`  ✓ Identifier length: ${round1Output.identifier.length} bytes`);
  console.log("Output format test passed");
}

async function signRound1RandomnessTest() {
  console.log("\nTesting sign round1 randomness...\n");

  const keygenOutput = runKeygenCentralizedEd25519();
  const clientKeyPackage = new Uint8Array(
    keygenOutput.keygen_outputs[Participant.P0].key_package,
  );

  const round1_1 = runSignRound1Ed25519(clientKeyPackage);
  const round1_2 = runSignRound1Ed25519(clientKeyPackage);
  const round1_3 = runSignRound1Ed25519(clientKeyPackage);

  const nonces1 = Buffer.from(round1_1.nonces).toString("hex");
  const nonces2 = Buffer.from(round1_2.nonces).toString("hex");
  const nonces3 = Buffer.from(round1_3.nonces).toString("hex");

  if (nonces1 === nonces2 || nonces1 === nonces3 || nonces2 === nonces3) {
    throw new Error("Nonces should be different on each call");
  }

  const commitments1 = Buffer.from(round1_1.commitments).toString("hex");
  const commitments2 = Buffer.from(round1_2.commitments).toString("hex");
  const commitments3 = Buffer.from(round1_3.commitments).toString("hex");

  if (
    commitments1 === commitments2 ||
    commitments1 === commitments3 ||
    commitments2 === commitments3
  ) {
    throw new Error("Commitments should be different on each call");
  }

  const id1 = Buffer.from(round1_1.identifier).toString("hex");
  const id2 = Buffer.from(round1_2.identifier).toString("hex");
  const id3 = Buffer.from(round1_3.identifier).toString("hex");

  if (id1 !== id2 || id2 !== id3) {
    throw new Error("Identifier should be identical across calls");
  }

  console.log(
    "Randomness test passed - nonces/commitments differ, identifier matches",
  );
}

async function signRound1ConsistencyTest() {
  console.log("\nTesting sign round1 consistency...\n");

  const keygenOutput = runKeygenCentralizedEd25519();
  const clientKeyPackage = new Uint8Array(
    keygenOutput.keygen_outputs[Participant.P0].key_package,
  );
  const serverKeyPackage = new Uint8Array(
    keygenOutput.keygen_outputs[Participant.P1].key_package,
  );

  const clientRound1 = runSignRound1Ed25519(clientKeyPackage);
  const serverRound1 = runSignRound1Ed25519(serverKeyPackage);

  const clientId = Buffer.from(clientRound1.identifier).toString("hex");
  const serverId = Buffer.from(serverRound1.identifier).toString("hex");
  const keygenClientId = Buffer.from(
    keygenOutput.keygen_outputs[Participant.P0].identifier,
  ).toString("hex");
  const keygenServerId = Buffer.from(
    keygenOutput.keygen_outputs[Participant.P1].identifier,
  ).toString("hex");

  if (clientId !== keygenClientId) {
    throw new Error("Client identifier should match key_package identifier");
  }
  if (serverId !== keygenServerId) {
    throw new Error("Server identifier should match key_package identifier");
  }
  if (clientId === serverId) {
    throw new Error("Client and server identifiers should be different");
  }

  console.log("Consistency test passed - identifiers match key_packages");
}

async function signRound1IntegrationTest() {
  console.log("\nTesting sign round1 integration with round2...\n");

  const keygenOutput = runKeygenCentralizedEd25519();
  const clientKeyPackage = new Uint8Array(
    keygenOutput.keygen_outputs[Participant.P0].key_package,
  );
  const serverKeyPackage = new Uint8Array(
    keygenOutput.keygen_outputs[Participant.P1].key_package,
  );

  const clientRound1 = runSignRound1Ed25519(clientKeyPackage);
  const serverRound1 = runSignRound1Ed25519(serverKeyPackage);

  const allCommitments: CommitmentEntry[] = [
    {
      identifier: clientRound1.identifier,
      commitments: clientRound1.commitments,
    },
    {
      identifier: serverRound1.identifier,
      commitments: serverRound1.commitments,
    },
  ];

  const message = new TextEncoder().encode("Test message");

  try {
    const clientRound2 = runSignRound2Ed25519(
      message,
      clientKeyPackage,
      new Uint8Array(clientRound1.nonces),
      allCommitments,
    );

    if (clientRound2.identifier.length === 0) {
      throw new Error("Round2 identifier should not be empty");
    }

    const round1Id = Buffer.from(clientRound1.identifier).toString("hex");
    const round2Id = Buffer.from(clientRound2.identifier).toString("hex");

    if (round1Id !== round2Id) {
      throw new Error("Round1 and Round2 identifiers should match");
    }

    console.log("Integration test passed - round1 output works with round2");
  } catch (error: any) {
    throw new Error(
      `Round1 output should be compatible with round2: ${error.message}`,
    );
  }
}

export async function runRound1Tests() {
  console.log("\n" + "=".repeat(50));
  console.log("Round 1 Tests");
  console.log("=".repeat(50));

  await signRound1BasicTest();
  await signRound1ErrorTest();
  await signRound1OutputFormatTest();
  await signRound1RandomnessTest();
  await signRound1ConsistencyTest();
  await signRound1IntegrationTest();

  console.log("\n✓ All Round 1 tests passed");
}

export async function runIntegrationTests() {
  console.log("\n" + "=".repeat(50));
  console.log("Integration Tests");
  console.log("=".repeat(50));

  const clientState = makeClientState();
  const serverState = makeServerState();
  const result = await signTestEd25519(clientState, serverState);

  console.log("\n=== Integration Test Complete ===");
  console.log(
    `Signature (hex): ${Buffer.from(result.signature).toString("hex")}`,
  );
  console.log(
    `Public Key (hex): ${Buffer.from(result.publicKey).toString("hex")}`,
  );
  console.log("\n✓ All integration tests passed");
}

// ============================================================================
// Test Runner
// ============================================================================

async function main() {
  console.log("Starting Ed25519 threshold signature tests...\n");

  try {
    await runRound1Tests();
    await runIntegrationTests();

    console.log("\n" + "=".repeat(50));
    console.log("All tests passed!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\nTest failed:", error);
    process.exit(1);
  }
}

main();
