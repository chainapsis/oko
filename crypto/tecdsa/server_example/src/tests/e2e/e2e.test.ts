import { makeClientState } from "@oko-wallet/cait-sith-keplr-addon/src/state";

import { e2eKeygenTest } from "./keygen";
import { e2ePresignTest } from "./presign";
import { e2eSignTest } from "./sign";

async function test() {
  const clientState = makeClientState();

  await e2eKeygenTest(clientState);

  await e2ePresignTest(clientState);

  await e2eSignTest(clientState);
}

test().then();
