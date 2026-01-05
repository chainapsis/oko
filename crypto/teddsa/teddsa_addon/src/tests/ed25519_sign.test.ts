import { Participant } from "@oko-wallet/teddsa-interface";
import type {
  TeddsaCentralizedKeygenOutput,
  TeddsaSignRound1Output,
  TeddsaCommitmentEntry,
  TeddsaSignatureShareEntry,
} from "@oko-wallet/teddsa-interface";

import {
  runKeygenCentralizedEd25519,
  runSignRound1Ed25519,
  runSignRound2Ed25519,
  runAggregateEd25519,
  runVerifyEd25519,
} from "../server";

interface TeddsaClientState {
  keygenOutput?: TeddsaCentralizedKeygenOutput;
  round1Output?: TeddsaSignRound1Output;
}

interface TeddsaServerState {
  keygenOutput?: TeddsaCentralizedKeygenOutput;
  round1Output?: TeddsaSignRound1Output;
}

function makeClientState(): TeddsaClientState {
  return {};
}

function makeServerState(): TeddsaServerState {
  return {};
}

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
  const allCommitments: TeddsaCommitmentEntry[] = [
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
  const allSignatureShares: TeddsaSignatureShareEntry[] = [
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

// Run the test
async function main() {
  console.log("Starting Ed25519 threshold signature test...\n");

  const clientState = makeClientState();
  const serverState = makeServerState();

  try {
    const result = await signTestEd25519(clientState, serverState);
    console.log("\n=== Test Complete ===");
    console.log(
      `Signature (hex): ${Buffer.from(result.signature).toString("hex")}`,
    );
    console.log(
      `Public Key (hex): ${Buffer.from(result.publicKey).toString("hex")}`,
    );
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

main();
