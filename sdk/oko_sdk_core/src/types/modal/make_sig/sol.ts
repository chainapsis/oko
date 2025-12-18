import type { MakeSigError } from "./common";

export interface MakeSolSigModalResult {
  chain_type: "sol";
  sig_result: MakeSolanaSigResult;
}

export type MakeSolanaSigData =
  | MakeSolTxSignData
  | MakeSolMessageSignData
  | MakeSolAllTxSignData;

export interface MakeSolTxSignData {
  chain_type: "sol";
  sign_type: "tx";
  payload: SolanaTxSignPayload;
}

export interface MakeSolMessageSignData {
  chain_type: "sol";
  sign_type: "message";
  payload: SolanaMessageSignPayload;
}

export interface MakeSolAllTxSignData {
  chain_type: "sol";
  sign_type: "all_tx";
  payload: SolanaAllTxSignPayload;
}

export type MakeSolanaSigResult =
  | {
      type: "signature";
      /** 64-byte ed25519 signature as hex string */
      signature: string;
    }
  | {
      type: "signatures";
      /** Array of 64-byte ed25519 signatures as hex strings */
      signatures: string[];
    };

export interface SolanaTxSignPayload {
  origin: string;
  /** Base58-encoded public key */
  signer: string;
  data: {
    /** Serialized transaction as base64 */
    serialized_transaction: string;
    /** Transaction message bytes to sign as base64 */
    message_to_sign: string;
    /** Whether this is a versioned transaction */
    is_versioned: boolean;
  };
}

export interface SolanaMessageSignPayload {
  origin: string;
  /** Base58-encoded public key */
  signer: string;
  data: {
    /** Message to sign as hex string */
    message: string;
  };
}

export interface SolanaAllTxSignPayload {
  origin: string;
  /** Base58-encoded public key */
  signer: string;
  data: {
    /** Array of serialized transactions as base64 */
    serialized_transactions: string[];
    /** Whether these are versioned transactions */
    is_versioned: boolean;
  };
}

export type MakeSolSigError =
  | {
      type: "unknown_error";
      error: any;
    }
  | {
      type: "invalid_transaction";
    }
  | {
      type: "wallet_not_connected";
    }
  | MakeSigError;
