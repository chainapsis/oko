export type HandleCallbackError =
  | { type: "msg_pass_fail"; error: string }
  | { type: "opener_window_not_exists" }
  | { type: "params_not_sufficient" }
  | { type: "wrong_ack_type"; msg_type: string };

export type SendMsgToEmbeddedWindowError =
  | {
    type: "window_not_found";
  }
  | {
    type: "send_to_parent_fail";
    error: string;
  }
  | {
    type: "unknown";
    error: string;
  };
