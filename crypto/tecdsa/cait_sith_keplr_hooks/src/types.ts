import type { Bytes32, Bytes33 } from "@oko-wallet/bytes";
import type { TriplePub, TriplesShare } from "@oko-wallet/tecdsa-interface";

export interface KeygenOutputBytes {
  tss_private_share: Bytes32;
  public_key: Bytes33;
}
export interface KeygenResult {
  keygen_1: KeygenOutputBytes;
  keygen_2: KeygenOutputBytes;
}

export interface TriplesResult {
  sessionId: string;
  triple0: { pub: TriplePub; share: TriplesShare };
  triple1: { pub: TriplePub; share: TriplesShare };
}
