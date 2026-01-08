import { EventEmitter } from "eventemitter3";

import type {
  SolWalletEvent,
  SolWalletEventHandler,
  SolWalletEventMap,
} from "./types";

export class SolWalletEventEmitter extends EventEmitter<SolWalletEvent> {
  on<K extends SolWalletEvent>(
    event: K,
    handler: SolWalletEventHandler<K>,
  ): this {
    return super.on(event, handler as (...args: unknown[]) => void);
  }

  once<K extends SolWalletEvent>(
    event: K,
    handler: SolWalletEventHandler<K>,
  ): this {
    return super.once(event, handler as (...args: unknown[]) => void);
  }

  off<K extends SolWalletEvent>(
    event: K,
    handler: SolWalletEventHandler<K>,
  ): this {
    return super.off(event, handler as (...args: unknown[]) => void);
  }

  emit<K extends SolWalletEvent>(
    event: K,
    ...args: SolWalletEventMap[K] extends void ? [] : [SolWalletEventMap[K]]
  ): boolean {
    return super.emit(event, ...args);
  }

  addListener<K extends SolWalletEvent>(
    event: K,
    handler: SolWalletEventHandler<K>,
  ): this {
    return this.on(event, handler);
  }

  removeListener<K extends SolWalletEvent>(
    event: K,
    handler: SolWalletEventHandler<K>,
  ): this {
    return this.off(event, handler);
  }
}
