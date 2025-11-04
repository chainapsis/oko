export type OkoCosmosWalletInitError =
  | {
      type: "oko_cosmos_wallet_init_fail";
      msg: string;
    }
  | {
      type: "unknown_error";
      msg: string;
    };

export type LazyInitError = {
  type: "oko_cosmos_wallet_lazy_init_fail";
};
