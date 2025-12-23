import type { Bytes33, Bytes64 } from "@oko-wallet/bytes";
import type { AuthType } from "@oko-wallet/oko-types/auth";

import type { CurveType } from "./curve_type";

export type KeyShareStatus = "active" | "inactive";

export interface KeyShare {
  share_id: string;
  wallet_id: string;
  enc_share: Buffer;
  created_at: Date;
  updated_at: Date;
  aux?: Record<string, any>;
  status: KeyShareStatus;
  reshared_at?: Date;
}

export type CreateKeyShareRequest = {
  wallet_id: string;
  enc_share: Buffer;
};

export type UpdateKeyShareRequest = {
  wallet_id: string;
  enc_share: Buffer;
  status: KeyShareStatus;
};

export interface RegisterKeyShareRequest {
  email: string;
  auth_type: AuthType;
  curve_type: CurveType;
  public_key: Bytes33;
  share: Bytes64;
}

export type RegisterKeyShareBody = {
  curve_type: CurveType;
  public_key: string; // hex string
  share: string;
};

export interface GetKeyShareRequest {
  email: string;
  auth_type: AuthType;
  public_key: Bytes33;
}

export interface GetKeyShareResponse {
  share_id: string;
  share: string;
}

export type GetKeyShareRequestBody = {
  public_key: string; // hex string
};

export interface CheckKeyShareRequest {
  email: string;
  auth_type: AuthType;
  public_key: Bytes33;
}

export interface CheckKeyShareResponse {
  exists: boolean;
}

export interface CheckKeyShareRequestBody {
  email: string;
  auth_type?: AuthType;
  public_key: string; // hex string
}

export interface ReshareKeyShareRequest {
  email: string;
  auth_type: AuthType;
  curve_type: CurveType;
  public_key: Bytes33;
  share: Bytes64;
}

export type ReshareKeyShareBody = {
  curve_type: CurveType;
  public_key: string; // hex string
  share: string; // hex string
};
