import type {
  TECDSAClientState,
  TECDSAServerState,
} from "@oko-wallet/tecdsa-interface";

import { runSignClientStep1, runSignClientStep2 } from "../client";
import { runSignServerStep1, runSignServerStep2, runVerify } from "../server";

export function signTest(
  clientState: TECDSAClientState,
  serverState: TECDSAServerState,
) {
  const msg = "TestMsg";

  // client execute step1
  const signClientStep1Result = runSignClientStep1(
    msg,
    clientState.presignOutput!,
  );
  clientState.signState = signClientStep1Result.st_0;

  // client -> server call step1
  // server msg receive
  serverState.signMessages = signClientStep1Result.msgs_1;
  const signServerStep1Result = runSignServerStep1(
    msg,
    serverState.presignOutput!,
  );
  serverState.signState = signServerStep1Result.st_1;

  // server -> client res step1
  clientState.signMessages = signServerStep1Result.msgs_0;

  // client execute step2
  const fullSignature0 = runSignClientStep2(
    clientState.signState,
    clientState.signMessages,
    clientState.presignOutput!,
  );

  // client -> server call step2
  const fullSignature2 = runSignServerStep2(
    serverState.signState,
    serverState.signMessages,
    serverState.presignOutput!,
  );

  if (
    fullSignature0.sig.big_r === fullSignature2.sig.big_r &&
    fullSignature0.sig.s === fullSignature2.sig.s
  ) {
    console.log(
      `sign success. r: ${fullSignature0.sig.big_r}, s: ${fullSignature0.sig.s}`,
    );
  } else {
    throw new Error("sign failed. big_r or s do not match");
  }

  const output = clientState.keygenOutput!;
  runVerify(fullSignature0, output.public_key, msg);
}
