export interface FullSignature {
  big_r: string;
  s: string;
}

export interface SignOutput {
  sig: FullSignature;
  is_high: boolean;
}

export type MakeSignaturePayload = {
  msg: Uint8Array;
};
