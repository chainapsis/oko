import type { Bytes32 } from "@oko-wallet/bytes";

export interface TeddsaKeygenOutputBytes {
  key_package: Uint8Array;
  public_key_package: Uint8Array;
  identifier: Uint8Array;
  public_key: Bytes32;
}

export interface TeddsaKeygenResult {
  keygen_1: TeddsaKeygenOutputBytes;
  keygen_2: TeddsaKeygenOutputBytes;
}
