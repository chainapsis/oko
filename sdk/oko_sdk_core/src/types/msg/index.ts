import type { ChainInfo } from "@keplr-wallet/types";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  OpenModalAckPayload,
  OpenModalPayload,
} from "@oko-wallet-sdk-core/types/modal";
import type { InitPayload } from "@oko-wallet-sdk-core/types/init";
import type { OAuthSignInError } from "@oko-wallet-sdk-core/types/sign_in";
import type { OAuthPayload } from "@oko-wallet-sdk-core/types/oauth";
import type { Bytes32 } from "@oko-wallet/bytes";

export type EWalletMsgGetPublicKey = {
  target: "oko_attached";
  msg_type: "get_public_key";
  payload: null;
};

export type EWalletMsgGetPublicKeyAck = {
  target: "oko_sdk";
  msg_type: "get_public_key_ack";
  payload: Result<string, string>;
};

export type EWalletMsgSetOAuthNonce = {
  target: "oko_attached";
  msg_type: "set_oauth_nonce";
  payload: string;
};

export type EWalletMsgSetOAuthNonceAck = {
  target: "oko_sdk";
  msg_type: "set_oauth_nonce_ack";
  payload: Result<null, string>;
};

export type EWalletMsgOAuthSignInUpdate = {
  target: "oko_sdk";
  msg_type: "oauth_sign_in_update";
  payload: Result<null, OAuthSignInError>;
};

export type EWalletMsgOAuthSignInUpdateAck = {
  target: "oko_attached";
  msg_type: "oauth_sign_in_update_ack";
  payload: null;
};

export type EWalletMsgOAuthInfoPass = {
  target: "oko_attached";
  msg_type: "oauth_info_pass";
  payload: OAuthPayload;
};

export type EWalletMsgOAuthInfoPassAck = {
  target: "oko_attached_popup";
  msg_type: "oauth_info_pass_ack";
  payload: null;
};

export type EWalletMsgSignOut = {
  target: "oko_attached";
  msg_type: "sign_out";
  payload: null;
};

export type EWalletMsgSignOutAck = {
  target: "oko_sdk";
  msg_type: "sign_out_ack";
  payload: Result<null, string>;
};

export type EWalletMsgOpenModal = {
  target: "oko_attached";
  msg_type: "open_modal";
  payload: OpenModalPayload;
};

export type EWalletMsgOpenModalAck = {
  target: "oko_sdk";
  msg_type: "open_modal_ack";
  payload: OpenModalAckPayload;
};

export type EWalletMsgHideModal = {
  target: "oko_attached";
  msg_type: "hide_modal";
  payload: null;
};

export type EWalletMsgHideModalAck = {
  target: "oko_sdk";
  msg_type: "hide_modal_ack";
  payload: Result<null, string>;
};

export type EWalletMsgInit = {
  target: "oko_sdk";
  msg_type: "init";
  payload: Result<InitPayload, string>;
};

export type EWalletMsgInitAck = {
  target: "oko_attached";
  msg_type: "init_ack";
  payload: Result<null, string>;
};

export type EWalletMsgGetEmail = {
  target: "oko_attached";
  msg_type: "get_email";
  payload: null;
};

export type EWalletMsgGetEmailAck = {
  target: "oko_sdk";
  msg_type: "get_email_ack";
  payload: Result<string, string>;
};

export type EWalletMsgGetCosmosChainInfo = {
  target: "oko_attached";
  msg_type: "get_cosmos_chain_info";
  payload: {
    chain_id: string | null;
  };
};

export type EWalletMsgGetCosmosChainInfoAck = {
  target: "oko_sdk";
  msg_type: "get_cosmos_chain_info_ack";
  payload: Result<ChainInfo[], string>;
};

export type EWalletMsgGetEthChainInfo = {
  target: "oko_attached";
  msg_type: "get_eth_chain_info";
  payload: {
    chain_id: string | null;
  };
};

export type EWalletMsgGetEthChainInfoAck = {
  target: "oko_sdk";
  msg_type: "get_eth_chain_info_ack";
  payload: Result<ChainInfo[], string>;
};

export type EWAlletMsgImportPrivateKey = {
  target: "oko_attached";
  msg_type: "import_private_key";
  payload: OAuthPayload;
};

export type EWalletMsgImportPrivateKeyAck = {
  target: "oko_sdk";
  msg_type: "import_private_key_ack";
  payload: Result<Bytes32, string>;
};

export type EWalletMsg =
  | EWalletMsgInit
  | EWalletMsgInitAck
  | EWalletMsgGetPublicKey
  | EWalletMsgGetPublicKeyAck
  | EWalletMsgSetOAuthNonce
  | EWalletMsgSetOAuthNonceAck
  | EWalletMsgOAuthSignInUpdate
  | EWalletMsgOAuthSignInUpdateAck
  | EWalletMsgOAuthInfoPass
  | EWalletMsgOAuthInfoPassAck
  | EWalletMsgSignOut
  | EWalletMsgSignOutAck
  | EWalletMsgOpenModal
  | EWalletMsgOpenModalAck
  | EWalletMsgHideModal
  | EWalletMsgHideModalAck
  | EWalletMsgGetEmail
  | EWalletMsgGetEmailAck
  | EWalletMsgGetCosmosChainInfo
  | EWalletMsgGetCosmosChainInfoAck
  | EWalletMsgGetEthChainInfo
  | EWalletMsgGetEthChainInfoAck
  | EWAlletMsgImportPrivateKey
  | EWalletMsgImportPrivateKeyAck
  | {
      target: "oko_sdk";
      msg_type: "unknown_msg_type";
      payload: string | null;
    };
