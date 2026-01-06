import type { MakeSigError } from "./common";

export interface MakeSolSigModalResult {
  chain_type: "sol";
  sig_result: MakeSolanaSigResult;
}

export type MakeSolanaSigData =
  | MakeSolTxSignData
  | MakeSolAllTxSignData
  | MakeSolMessageSignData;

export interface MakeSolTxSignData {
  chain_type: "sol";
  sign_type: "tx";
  payload: SolanaTxSignPayload;
}

export interface MakeSolAllTxSignData {
  chain_type: "sol";
  sign_type: "all_tx";
  payload: SolanaAllTxSignPayload;
}

export interface MakeSolMessageSignData {
  chain_type: "sol";
  sign_type: "message";
  payload: SolanaMessageSignPayload;
}

export type MakeSolanaSigResult =
  | { type: "signature"; signature: string }
  | { type: "signatures"; signatures: string[] };

export interface SolanaTxSignPayload {
  origin: string;
  signer: string;
  data: {
    serialized_transaction: string;
    message_to_sign: string;
    is_versioned: boolean;
  };
}

export interface SolanaAllTxSignPayload {
  origin: string;
  signer: string;
  data: {
    serialized_transactions: string[];
    messages_to_sign: string[];
    is_versioned: boolean;
  };
}

export interface SolanaMessageSignPayload {
  origin: string;
  signer: string;
  data: {
    message: string;
  };
}

export type MakeSolSigError =
  | {
      type: "unknown_error";
      error: any;
    }
  | MakeSigError;
