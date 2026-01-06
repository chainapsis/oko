import type { TeddsaKeygenOutput } from "../keygen";

export interface TeddsaKeygenInitRequest {
  user_id: string;
}

export interface TeddsaKeygenInitResponse {
  session_id: string;
}

export interface TeddsaKeygenStoreRequest {
  user_id: string;
  session_id: string;
  keygen_output: TeddsaKeygenOutput;
  public_key: number[];
}

export interface TeddsaKeygenStoreResponse {
  success: boolean;
  public_key: number[];
}
