import type {
  TECDSAClientState,
  TECDSAServerState,
} from "@oko-wallet/tecdsa-interface";

import { runTriplesServerStep1 } from "../server";

export function triplesTest2(
  clientState: TECDSAClientState,
  serverState: TECDSAServerState,
) {
  const result = runTriplesServerStep1();

  clientState.triple0Pub = result.pub0;
  clientState.triple1Pub = result.pub1;
  clientState.triple0Share0 = result.shares0[0];
  clientState.triple1Share1 = result.shares1[0];

  serverState.triple0Pub = result.pub0;
  serverState.triple1Pub = result.pub1;
  serverState.triple0Share = result.shares0[1];
  serverState.triple1Share = result.shares1[1];
}
