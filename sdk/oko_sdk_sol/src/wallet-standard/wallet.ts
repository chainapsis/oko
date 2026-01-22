import type {
  IdentifierString,
  Wallet,
  WalletAccount,
  WalletIcon,
} from "@wallet-standard/base";
import type {
  StandardEventsListeners,
  StandardEventsNames,
  StandardEventsOnMethod,
} from "@wallet-standard/features";

import { OkoSolanaWalletAccount } from "./account";
import type { WalletStandardConfig } from "./chains";
import {
  createSignAndSendTransactionFeature,
  createSignMessageFeature,
  createSignTransactionFeature,
} from "./features";
import { OKO_ICON } from "./icon";
import { createSignInFeature } from "./sign-in";
import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";

export const OKO_WALLET_NAME = "Oko" as const;

export class OkoStandardWallet implements Wallet {
  readonly #wallet: OkoSolWalletInterface;
  readonly #config: WalletStandardConfig;
  #accounts: WalletAccount[] = [];
  #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } =
    {};

  readonly version = "1.0.0" as const;
  readonly name = OKO_WALLET_NAME;
  readonly icon: WalletIcon = OKO_ICON;
  readonly chains: readonly IdentifierString[];

  get accounts(): readonly WalletAccount[] {
    return this.#accounts;
  }

  get features(): Record<string, unknown> {
    const { features } = this.#config;
    return {
      "standard:connect": {
        version: "1.0.0",
        connect: async () => {
          let existingKey = await this.#wallet.okoWallet.getPublicKeyEd25519();
          if (!existingKey) {
            await this.#wallet.okoWallet.openSignInModal();
            existingKey = await this.#wallet.okoWallet.getPublicKeyEd25519();
          }
          await this.#wallet.connect();
          this.#updateAccounts();
          return { accounts: this.#accounts };
        },
      },
      "standard:disconnect": {
        version: "1.0.0",
        disconnect: async () => {
          await this.#wallet.disconnect();
        },
      },
      "standard:events": {
        version: "1.0.0",
        on: this.#on.bind(this) as StandardEventsOnMethod,
      },
      ...createSignInFeature(this.#wallet, this.#config),
      ...createSignMessageFeature(this.#wallet, features.signMessage),
      ...createSignTransactionFeature(
        this.#wallet,
        features.signTransaction,
        this.#config,
      ),
      ...createSignAndSendTransactionFeature(
        this.#wallet,
        features.signAndSendTransaction,
        this.#config,
      ),
    };
  }

  constructor(wallet: OkoSolWalletInterface, config: WalletStandardConfig) {
    this.#wallet = wallet;
    this.#config = config;
    this.chains = config.chains;

    if (wallet.connected && wallet.publicKey) {
      this.#updateAccounts();
    }

    wallet.on("connect", () => {
      this.#updateAccounts();
      this.#emit("change", { accounts: this.#accounts });
    });

    wallet.on("disconnect", () => {
      this.#accounts = [];
      this.#emit("change", { accounts: this.#accounts });
    });

    wallet.on("accountChanged", () => {
      this.#updateAccounts();
      this.#emit("change", { accounts: this.#accounts });
    });
  }

  #on<E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E],
  ): () => void {
    if (!this.#listeners[event]) {
      this.#listeners[event] = [];
    }
    this.#listeners[event]!.push(listener);

    return () => {
      const listeners = this.#listeners[event];
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    const listeners = this.#listeners[event];
    if (listeners) {
      for (const listener of listeners) {
        (listener as (...a: unknown[]) => void)(...args);
      }
    }
  }

  #updateAccounts(): void {
    const publicKey = this.#wallet.publicKey;
    if (publicKey) {
      const accountFeatures = [
        this.#config.features.signIn,
        this.#config.features.signMessage,
        this.#config.features.signTransaction,
        this.#config.features.signAndSendTransaction,
      ];
      this.#accounts = [
        new OkoSolanaWalletAccount(
          publicKey.toBase58(),
          publicKey.toBytes(),
          this.#config.chains,
          accountFeatures,
        ),
      ];
    } else {
      this.#accounts = [];
    }
  }
}
