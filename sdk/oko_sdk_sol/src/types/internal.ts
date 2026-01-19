import type { SolWalletEventEmitter } from "../emitter";
import type { OkoSolWalletInterface } from "./sol_wallet";

/**
 * Internal interface that extends OkoSolWalletInterface with private emitter.
 * Used internally by SDK methods that need access to the event emitter.
 */
export interface OkoSolWalletInternal extends OkoSolWalletInterface {
  _emitter: SolWalletEventEmitter;
  _accountsChangedHandler: (payload: { publicKey: string | null }) => void;
}
