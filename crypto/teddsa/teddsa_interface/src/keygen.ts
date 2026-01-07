// NOTE: Raw types are direct WASM output format using number[] for byte arrays

export interface KeyPackageRaw {
  identifier: number[];
  signing_share: number[];
  verifying_share: number[];
  verifying_key: number[];
  min_signers: number;
}

export interface PublicKeyPackageRaw {
  verifying_shares: Record<string, number[]>;
  verifying_key: number[];
}

export interface CentralizedKeygenOutput {
  keygen_outputs: KeyPackageRaw[];
  public_key_package: PublicKeyPackageRaw;
}

export interface ClientKeygenState {
  client_key_package: KeyPackageRaw | null;
  server_key_package: KeyPackageRaw | null;
  public_key_package: PublicKeyPackageRaw | null;
}
