import type { Address, TypedDataDefinition } from "viem";

import type {
  EIP712Domain,
  PermitDetails,
} from "@oko-wallet-attached/web3/ethereum/schema";

export interface ERC2612PermitAction {
  kind: "erc2612.permit";
  owner: Address;
  spender: Address;
  amount: string | bigint;
  deadline: string | bigint;
  nonce: string | bigint;
  domain: EIP712Domain;
  tokenLogoURI?: string;
  typedData: TypedDataDefinition;
}

export interface DAIPermitAction {
  kind: "dai.permit";
  holder: Address;
  spender: Address;
  nonce: string | bigint;
  expiry: string | bigint;
  allowed: boolean;
  domain: EIP712Domain;
  tokenLogoURI?: string;
  typedData: TypedDataDefinition;
}

export interface UniswapPermitSingleAction {
  kind: "uniswap.permitSingle";
  details: PermitDetails;
  spender: Address;
  sigDeadline: string | bigint | number;
  domain: EIP712Domain;
  tokenLogoURI?: string;
  typedData: TypedDataDefinition;
}

// It seems batch is rarely used...
// export interface UniswapPermitBatchAction {
//   kind: "uniswap.permitBatch";
//   details: PermitDetails[];
//   spender: Address;
//   sigDeadline: string | bigint | number;
//   domain: EIP712Domain;
//   typedData: TypedDataDefinition;
// }

export interface EIP3009TransferWithAuthorizationAction {
  kind: "eip3009.transferWithAuthorization";
  from: Address;
  to: Address;
  value: string | bigint;
  validAfter: string | bigint;
  validBefore: string | bigint;
  nonce: string;
  domain: EIP712Domain;
  tokenLogoURI?: string;
  typedData: TypedDataDefinition;
}

export interface UnknownAction {
  kind: "unknown";
  typedData: TypedDataDefinition;
}

export type EIP712Action =
  | ERC2612PermitAction
  | DAIPermitAction
  | UniswapPermitSingleAction
  | EIP3009TransferWithAuthorizationAction
  // | UniswapPermitBatchAction
  | UnknownAction;
