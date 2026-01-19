import type {
  MakeSigModalErrorAckPayload,
  OtherModalErrorAckPayload,
} from "./modal";

type ErrorAck = MakeSigModalErrorAckPayload | OtherModalErrorAckPayload;

describe("type test 123", () => {
  it("t", () => {
    function dummy(err: ErrorAck) {
      err.error.type;
    }
  });
});
