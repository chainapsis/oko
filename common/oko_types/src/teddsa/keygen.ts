export interface KeygenInitRequest {
  user_id: string;
}

export interface KeygenInitResponse {
  session_id: string;
}

export interface KeygenStoreRequest {
  user_id: string;
  session_id: string;
  key_package: KeyPackageRaw;
  public_key_package: PublicKeyPackageRaw;
}

export interface KeygenStoreResponse {
  success: boolean;
  verifying_key: number[];
}

export interface KeyPackageRaw {
  identifier: number[];
  signing_share: number[];
  verifying_share: number[];
  verifying_key: number[];
  min_signers: number;
}

export interface VerifyingShareEntry {
  identifier: string;
  share: number[];
}

export interface PublicKeyPackageRaw {
  verifying_shares: VerifyingShareEntry[];
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
