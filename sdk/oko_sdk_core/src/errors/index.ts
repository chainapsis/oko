export type OkoWalletInitError =
  | {
      type: "is_locked";
    }
  | {
      type: "not_in_browser";
    }
  | {
      type: "host_origin_empty";
    }
  | {
      type: "sdk_endpoint_invalid_url";
    }
  | {
      type: "iframe_setup_fail"; //
      msg: string;
    }
  | {
      type: "unknown_error";
      msg: string;
    };

export type OpenModalError =
  | {
      type: "timeout";
    }
  | {
      type: "invalid_ack_type";
      received: string;
    }
  | {
      type: "unknown_error";
      error: any;
    };
