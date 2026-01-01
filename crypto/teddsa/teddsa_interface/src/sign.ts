export interface TeddsaSignRound1Output {
  nonces: number[];
  commitments: number[];
  identifier: number[];
}

export interface TeddsaSignRound2Output {
  signature_share: number[];
  identifier: number[];
}

export interface TeddsaCommitmentEntry {
  identifier: number[];
  commitments: number[];
}

export interface TeddsaSignatureShareEntry {
  identifier: number[];
  signature_share: number[];
}

export interface TeddsaAggregateOutput {
  signature: number[];
}

export interface TeddsaSignature {
  signature: string;
}

export interface TeddsaClientSignState {
  message: Uint8Array | null;
  nonces: number[] | null;
  commitments: number[] | null;
  all_commitments: TeddsaCommitmentEntry[] | null;
  all_signature_shares: TeddsaSignatureShareEntry[] | null;
}
