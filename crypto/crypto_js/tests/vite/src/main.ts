import { encryptDataAsync } from "@oko-wallet/crypto-js/src/aes_gcm";

async function test() {
  const encrypted = await encryptDataAsync("hello", "password");
  console.log("encrypted", encrypted);
}

test().then();
