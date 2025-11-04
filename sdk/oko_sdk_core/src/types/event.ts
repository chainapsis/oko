export interface AccountsChangedPayload {
  email: string | null;
  publicKey: string | null;
}

export type OkoWalletCoreEvent2 =
  | {
      type: "CORE__accountsChanged";
      email: string | null;
      publicKey: string | null;
    }
  | {
      type: "CORE__chainChanged";
    };

export type OkoWalletCoreEventHandler2 =
  | {
      type: "CORE__accountsChanged";
      handler: (payload: AccountsChangedPayload) => void;
    }
  | {
      type: "CORE__chainChanged";
      handler: (payload: void) => void;
    };
