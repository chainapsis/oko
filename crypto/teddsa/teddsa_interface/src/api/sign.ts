import type { CommitmentEntry, SignatureShareEntry } from "../sign";

export interface SignInitRequest {
  session_id: string;
  message: number[];
}

export interface SignInitResponse {
  sign_session_id: string;
}

export interface SignRound1Request {
  sign_session_id: string;
  client_commitment: CommitmentEntry;
}

export interface SignRound1Response {
  server_commitment: CommitmentEntry;
}

export interface SignRound2Request {
  sign_session_id: string;
  client_signature_share: SignatureShareEntry;
}

export interface SignRound2Response {
  server_signature_share: SignatureShareEntry;
}
