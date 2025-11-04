export type OkoEthWalletInitError =
  | {
      type: "oko_eth_wallet_init_fail";
      msg: string;
    }
  | {
      type: "unknown_error";
      msg: string;
    };

export type LazyInitError = {
  type: "oko_eth_wallet_lazy_init_fail";
};

export type SendGetEthChainInfoError =
  | { type: "wrong_ack_message_type" }
  | { type: "payload_contains_err"; err: any };
