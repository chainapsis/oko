import type {
  OkoCosmosWalletInterface,
  OkoCosmosWalletEventHandler2,
} from "@oko-wallet-sdk-cosmos/types";

export function on(
  this: OkoCosmosWalletInterface,
  handlerDef: OkoCosmosWalletEventHandler2,
) {
  this.eventEmitter.on(handlerDef);
}
