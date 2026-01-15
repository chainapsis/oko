import type { Bytes32 } from "@oko-wallet/bytes";
import type {
  KeyPackageRaw,
  PublicKeyPackageRaw,
} from "@oko-wallet/oko-types/teddsa";

export interface TeddsaKeygenOutputBytes {
  key_package: KeyPackageRaw;
  public_key_package: PublicKeyPackageRaw;
  identifier: Uint8Array;
  public_key: Bytes32;
}

export interface TeddsaKeygenResult {
  keygen_1: TeddsaKeygenOutputBytes;
  keygen_2: TeddsaKeygenOutputBytes;
}
