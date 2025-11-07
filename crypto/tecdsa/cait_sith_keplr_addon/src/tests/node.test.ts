import { makeClientState, makeServerState } from "../state";
import { signTest3 } from "./eth_tx_sign.test";

async function test() {
  const clientState = makeClientState();
  const serverState = makeServerState();

  await signTest3(clientState, serverState);
}

test();

// describe('noop', () => {
//   it('noop', async () => {});
// });
