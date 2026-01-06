import type { TeddsaCommitmentEntry, TeddsaSignatureShareEntry } from "../sign";

export interface TeddsaSignRound1Request {
  session_id: string;
  message: number[];
  client_commitment: TeddsaCommitmentEntry;
}

export interface TeddsaSignRound1Response {
  server_commitment: TeddsaCommitmentEntry;
}

export interface TeddsaSignRound2Request {
  session_id: string;
  client_signature_share: TeddsaSignatureShareEntry;
}

export interface TeddsaSignRound2Response {
  server_signature_share: TeddsaSignatureShareEntry;
}

export interface TeddsaAggregateRequest {
  session_id: string;
  message: number[];
  all_commitments: TeddsaCommitmentEntry[];
  all_signature_shares: TeddsaSignatureShareEntry[];
}

export interface TeddsaAggregateResponse {
  signature: number[];
}
