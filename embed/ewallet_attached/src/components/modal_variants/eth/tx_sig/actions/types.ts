import type { AppCurrency } from "@keplr-wallet/types";
import type { Address, Chain } from "viem";

export interface NativeTransferTxAction {
  kind: "native.transfer";
  to: Address;
  currency: AppCurrency;
  amount: bigint;
}

export interface ERC20TransferAction {
  kind: "erc20.transfer";
  tokenAddress: Address;
  to: Address;
  currency?: AppCurrency;
  amount: bigint;
}

export interface ERC20TransferFromAction {
  kind: "erc20.transferFrom";
  tokenAddress: Address;
  from: Address;
  to: Address;
  currency?: AppCurrency;
  amount: bigint;
}

export interface ERC20ApproveAction {
  kind: "erc20.approve";
  tokenAddress: Address;
  to: Address;
  currency?: AppCurrency;
  amount: bigint;
}

export interface ERC20PermitAction {
  kind: "erc20.permit";
  tokenAddress: Address;
  owner: Address;
  to: Address;
  currency?: AppCurrency;
  amount: bigint;
  deadline: number;
}

export interface UnknownAction {
  kind: "unknown";
  title: string;
  description?: string;
}

export type EthTxAction =
  | NativeTransferTxAction
  | ERC20TransferAction
  | ERC20TransferFromAction
  | ERC20ApproveAction
  | ERC20PermitAction
  | UnknownAction;

export type RenderContext = {
  chain?: Chain;
  isLoading?: boolean;
  error?: Error;
};
