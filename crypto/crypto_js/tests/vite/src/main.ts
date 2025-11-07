import { getRandomBytes } from "@oko-wallet/crypto-js/web_crypto";

async function test() {
  const bytes = getRandomBytes(5);
  console.log("bytes", bytes);

  // const base64 = arrayBufferToBase64Url(bytes);
  // console.log("base64", base64);
}

test().then();
