import type { OkoSolWalletInterface } from "./sol_wallet";
import type { SolWalletEventEmitter } from "../emitter";

/**
 * Internal interface that extends OkoSolWalletInterface with private emitter.
 * Used internally by SDK methods that need access to the event emitter.
 */
export interface OkoSolWalletInternal extends OkoSolWalletInterface {
  _emitter: SolWalletEventEmitter;
}
