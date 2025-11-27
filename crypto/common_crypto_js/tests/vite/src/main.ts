import { generateEddsaKeypair } from "@oko-wallet/common-crypto-js/src/ecdhe/x25519";

async function test() {
  const keypairResult = generateEddsaKeypair();
  if (!keypairResult.success) {
    console.error("Failed to generate keypair", keypairResult.err);
    return;
  }
  const keypair = keypairResult.data;
  console.log("keypair", keypair);
}

test().then();
