import { registerWallet } from "@wallet-standard/wallet";
import type {
  Wallet,
  WalletAccount,
  WalletIcon,
  IdentifierString,
} from "@wallet-standard/base";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListeners,
  StandardEventsNames,
  StandardEventsOnMethod,
} from "@wallet-standard/features";
import type { OkoSolWalletInterface } from "@oko-wallet/oko-sdk-sol";
import { OKO_ICON } from "./constant";

// Rialo chain identifiers
const RIALO_DEVNET_CHAIN = "rialo:devnet" as IdentifierString;
const RIALO_TESTNET_CHAIN = "rialo:testnet" as IdentifierString;
const RIALO_LOCALNET_CHAIN = "rialo:localnet" as IdentifierString;
const RIALO_MAINNET_CHAIN = "rialo:mainnet" as IdentifierString;

const RIALO_CHAINS = [
  RIALO_DEVNET_CHAIN,
  RIALO_TESTNET_CHAIN,
  RIALO_LOCALNET_CHAIN,
  RIALO_MAINNET_CHAIN,
] as const;

// Rialo feature identifiers
const RialoSignMessage = "rialo:signMessage" as const;
const RialoSignTransaction = "rialo:signTransaction" as const;
const RialoSignAndSendTransaction = "rialo:signAndSendTransaction" as const;
const RialoSignAndSendAllTransactions =
  "rialo:signAndSendAllTransactions" as const;

const OKO_WALLET_NAME = "Oko" as const;

// Account features for Rialo
const OKO_RIALO_ACCOUNT_FEATURES: IdentifierString[] = [
  RialoSignMessage,
  RialoSignTransaction,
  RialoSignAndSendTransaction,
];

class OkoRialoWalletAccount implements WalletAccount {
  readonly #address: string;
  readonly #publicKey: Uint8Array;
  readonly #chains = RIALO_CHAINS;
  readonly #features = OKO_RIALO_ACCOUNT_FEATURES;

  constructor(address: string, publicKey: Uint8Array) {
    this.#address = address;
    this.#publicKey = publicKey;
    Object.freeze(this);
  }

  get address(): string {
    return this.#address;
  }

  get publicKey(): Uint8Array {
    return this.#publicKey.slice();
  }

  get chains(): readonly IdentifierString[] {
    return this.#chains.slice();
  }

  get features(): readonly IdentifierString[] {
    return this.#features.slice();
  }

  get label(): string | undefined {
    return undefined;
  }

  get icon(): WalletIcon | undefined {
    return undefined;
  }
}

type RialoSignMessageFeature = {
  readonly [RialoSignMessage]: {
    readonly version: "1.0.0";
    readonly signMessage: (
      ...inputs: readonly {
        readonly account: WalletAccount;
        readonly message: Uint8Array;
      }[]
    ) => Promise<
      readonly {
        readonly signedMessage: Uint8Array;
        readonly signature: Uint8Array;
        readonly signatureType?: "ed25519";
      }[]
    >;
  };
};

type RialoSignTransactionFeature = {
  readonly [RialoSignTransaction]: {
    readonly version: "1.0.0";
    readonly signTransaction: (
      ...inputs: readonly {
        readonly account: WalletAccount;
        readonly transaction: Uint8Array;
        readonly chain?: IdentifierString;
      }[]
    ) => Promise<
      readonly {
        readonly signedTransaction: Uint8Array;
      }[]
    >;
  };
};

type RialoSignAndSendTransactionFeature = {
  readonly [RialoSignAndSendTransaction]: {
    readonly version: "1.0.0";
    readonly signAndSendTransaction: (
      ...inputs: readonly {
        readonly account: WalletAccount;
        readonly transaction: Uint8Array;
        readonly chain: IdentifierString;
      }[]
    ) => Promise<
      readonly {
        readonly signature: Uint8Array;
      }[]
    >;
  };
};

type RialoSignAndSendAllTransactionsFeature = {
  readonly [RialoSignAndSendAllTransactions]: {
    readonly version: "1.0.0";
    readonly signAndSendAllTransactions: (
      inputs: readonly {
        readonly account: WalletAccount;
        readonly transaction: Uint8Array;
        readonly chain: IdentifierString;
      }[],
      options?: { readonly mode?: "parallel" | "serial" }
    ) => Promise<
      readonly PromiseSettledResult<{
        readonly signature: Uint8Array;
      }>[]
    >;
  };
};

type OkoRialoWalletFeatures = StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature &
  RialoSignMessageFeature &
  RialoSignTransactionFeature &
  RialoSignAndSendTransactionFeature &
  RialoSignAndSendAllTransactionsFeature;

export class OkoRialoStandardWallet implements Wallet {
  readonly #wallet: OkoSolWalletInterface;
  #accounts: WalletAccount[] = [];
  #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } =
    {};

  readonly version = "0.0.1" as const;
  readonly name = OKO_WALLET_NAME;
  readonly icon: WalletIcon = OKO_ICON;
  readonly chains: readonly IdentifierString[] = RIALO_CHAINS;

  get accounts(): readonly WalletAccount[] {
    return this.#accounts;
  }

  get features(): OkoRialoWalletFeatures {
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
      [RialoSignMessage]: {
        version: "1.0.0",
        signMessage: async (...inputs) => {
          const outputs = [];
          for (const input of inputs) {
            const signature = await this.#wallet.signMessage(input.message);
            outputs.push({
              signedMessage: input.message,
              signature,
              signatureType: "ed25519" as const,
            });
          }
          return outputs;
        },
      },
      [RialoSignTransaction]: {
        version: "1.0.0",
        signTransaction: async (...inputs) => {
          const outputs = [];
          for (const input of inputs) {
            // Rialo transaction format: [num_sigs (1)] [sigs (64*n)] [message]
            const txBytes = input.transaction;
            const numSignatures = txBytes[0];
            const signaturesOffset = 1;
            const signaturesLength = numSignatures * 64;
            const messageOffset = signaturesOffset + signaturesLength;
            const message = txBytes.slice(messageOffset);

            const signature = await this.#wallet.signMessage(message);

            const signedTransaction = new Uint8Array(txBytes.length);
            signedTransaction.set(txBytes);
            signedTransaction.set(signature, signaturesOffset);

            outputs.push({ signedTransaction });
          }
          return outputs;
        },
      },
      [RialoSignAndSendTransaction]: {
        version: "1.0.0",
        signAndSendTransaction: async (...inputs) => {
          const outputs = [];
          for (const input of inputs) {
            const txBytes = input.transaction;
            const numSignatures = txBytes[0];
            const signaturesOffset = 1;
            const signaturesLength = numSignatures * 64;
            const messageOffset = signaturesOffset + signaturesLength;
            const message = txBytes.slice(messageOffset);

            const signature = await this.#wallet.signMessage(message);
            outputs.push({ signature });
          }
          return outputs;
        },
      },
      [RialoSignAndSendAllTransactions]: {
        version: "1.0.0",
        signAndSendAllTransactions: async (inputs, options) => {
          const mode = options?.mode ?? "serial";

          const signOne = async (input: {
            readonly transaction: Uint8Array;
          }): Promise<{ signature: Uint8Array }> => {
            const txBytes = input.transaction;
            const numSignatures = txBytes[0];
            const signaturesOffset = 1;
            const signaturesLength = numSignatures * 64;
            const messageOffset = signaturesOffset + signaturesLength;
            const message = txBytes.slice(messageOffset);

            const signature = await this.#wallet.signMessage(message);
            return { signature };
          };

          if (mode === "parallel") {
            return Promise.allSettled(inputs.map(signOne));
          }

          const results: PromiseSettledResult<{ signature: Uint8Array }>[] = [];
          for (const input of inputs) {
            try {
              const result = await signOne(input);
              results.push({ status: "fulfilled", value: result });
            } catch (error) {
              results.push({ status: "rejected", reason: error });
            }
          }
          return results;
        },
      },
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
    listener: StandardEventsListeners[E]
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
        new OkoRialoWalletAccount(publicKey.toBase58(), publicKey.toBytes()),
      ];
    } else {
      this.#accounts = [];
    }
  }
}

let registered = false;

export function registerOkoRialoWallet(wallet: OkoSolWalletInterface): void {
  if (registered) {
    return;
  }

  const standardWallet = new OkoRialoStandardWallet(wallet);
  registerWallet(standardWallet);
  registered = true;
}
