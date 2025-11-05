import type {
  TECDSAClientState,
  TECDSAServerState,
} from "@oko-wallet/tecdsa-interface";

import {
  runPresignClientStep1,
  runPresignClientStep2,
  runPresignClientStep3,
} from "../client";
import {
  runPresignServerStep1,
  runPresignServerStep2,
  runPresignServerStep3,
} from "../server";

export function presignTest(
  clientState: TECDSAClientState,
  serverState: TECDSAServerState,
) {
  // // client -> server triple request
  // // server execute triple gen
  // const { pub0, pub1, shares0, shares1 } = runTriplesServerStep1();
  // serverState.triple0Pub = pub0;
  // serverState.triple1Pub = pub1;
  // serverState.triple0Share = shares0[1];
  // serverState.triple1Share = shares1[1];

  // // server -> client triple res
  // clientState.triple0Pub = pub0;
  // clientState.triple1Pub = pub1;
  // clientState.triple0Share0 = shares0[0];
  // clientState.triple1Share1 = shares1[0];

  // client execute step1
  const presignClientStep1Result = runPresignClientStep1(
    clientState.triple0Pub!,
    clientState.triple1Pub!,
    clientState.triple0Share0!,
    clientState.triple1Share1!,
    clientState.keygenOutput!,
  );
  clientState.presignState = presignClientStep1Result.st_0;

  // client -> server call step1
  // server msg receive
  serverState.presignMessages = presignClientStep1Result.msgs_1;
  const presignServerStep1Result = runPresignServerStep1(
    serverState.triple0Pub!,
    serverState.triple1Pub!,
    serverState.triple0Share!,
    serverState.triple1Share!,
    serverState.keygenOutput!,
  );
  serverState.presignState = presignServerStep1Result.state;

  // server -> client res step1
  clientState.presignMessages = presignServerStep1Result.msgs0;

  // client execute step2
  const presignClientStep2Result = runPresignClientStep2(
    clientState.presignState,
  );
  clientState.presignState = presignClientStep2Result.st_0;

  // client -> server call step2
  // server msg receive
  serverState.presignMessages.wait_1[0] =
    presignClientStep2Result.msgs_1.wait_1[0];
  const presignServerStep2Result = runPresignServerStep2(
    serverState.presignState,
  );
  serverState.presignState = presignServerStep2Result.state;

  // server -> client res step2
  clientState.presignMessages.wait_1[1] =
    presignServerStep2Result.msgs0.wait_1[1];

  // client execute step3
  const presignOutput0 = runPresignClientStep3(
    clientState.presignState,
    clientState.presignMessages,
  );
  clientState.presignOutput = presignOutput0;

  // client -> server call step3
  const presignOutput2 = runPresignServerStep3(
    serverState.presignState,
    serverState.presignMessages,
  );
  serverState.presignOutput = presignOutput2;

  if (presignOutput0.big_r === presignOutput2.big_r) {
    console.log(`presign success. big_r: ${presignOutput0.big_r}`);
  } else {
    throw new Error("presign failed. big_r do not match");
  }
}
