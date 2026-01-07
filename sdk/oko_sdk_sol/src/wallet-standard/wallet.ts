import type {
  IdentifierString,
  Wallet,
  WalletAccount,
  WalletIcon,
} from "@wallet-standard/base";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListeners,
  StandardEventsNames,
  StandardEventsOnMethod,
} from "@wallet-standard/features";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignInFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "@solana/wallet-standard-features";

import type { OkoSolWalletInterface } from "@oko-wallet-sdk-sol/types";
import { OkoSolanaWalletAccount } from "./account";
import { SOLANA_CHAINS } from "./chains";
import {
  createSignAndSendTransactionFeature,
  createSignMessageFeature,
  createSignTransactionFeature,
} from "./features";
import { createSignInFeature } from "./sign-in";
import { OKO_ICON } from "./icon";

export const OKO_WALLET_NAME = "Oko" as const;

type OkoWalletFeatures = StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature &
  SolanaSignInFeature &
  SolanaSignMessageFeature &
  SolanaSignTransactionFeature &
  SolanaSignAndSendTransactionFeature;

export class OkoStandardWallet implements Wallet {
  readonly #wallet: OkoSolWalletInterface;
  #accounts: WalletAccount[] = [];
  #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } =
    {};

  readonly version = "1.0.0" as const;
  readonly name = OKO_WALLET_NAME;
  readonly icon: WalletIcon = OKO_ICON;
  readonly chains: readonly IdentifierString[] = SOLANA_CHAINS;

  get accounts(): readonly WalletAccount[] {
    return this.#accounts;
  }

  get features(): OkoWalletFeatures {
    return {
      "standard:connect": {
        version: "1.0.0",
        connect: async () => {
          // Check if user is signed in
          let existingKey = await this.#wallet.okoWallet.getPublicKeyEd25519();

          if (!existingKey) {
            // Trigger OAuth sign-in
            await this.#wallet.okoWallet.openConnectModal();

            // Re-check after sign-in
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
      ...createSignInFeature(this.#wallet),
      ...createSignMessageFeature(this.#wallet),
      ...createSignTransactionFeature(this.#wallet),
      ...createSignAndSendTransactionFeature(this.#wallet),
    };
  }

  constructor(wallet: OkoSolWalletInterface) {
    this.#wallet = wallet;

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
      this.#accounts = [
        new OkoSolanaWalletAccount(publicKey.toBase58(), publicKey.toBytes()),
      ];
    } else {
      this.#accounts = [];
    }
  }
}
