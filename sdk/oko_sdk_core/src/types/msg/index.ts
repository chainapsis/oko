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

export type OkoWalletMsgGetPublicKey = {
  target: "oko_attached";
  msg_type: "get_public_key";
  payload: null;
};

export type OkoWalletMsgGetPublicKeyAck = {
  target: "oko_sdk";
  msg_type: "get_public_key_ack";
  payload: Result<string, string>;
};

export type OkoWalletMsgSetOAuthNonce = {
  target: "oko_attached";
  msg_type: "set_oauth_nonce";
  payload: string;
};

export type OkoWalletMsgSetOAuthNonceAck = {
  target: "oko_sdk";
  msg_type: "set_oauth_nonce_ack";
  payload: Result<null, string>;
};

export type OkoWalletMsgOAuthSignInUpdate = {
  target: "oko_sdk";
  msg_type: "oauth_sign_in_update";
  payload: Result<null, OAuthSignInError>;
};

export type OkoWalletMsgOAuthSignInUpdateAck = {
  target: "oko_attached";
  msg_type: "oauth_sign_in_update_ack";
  payload: null;
};

export type OkoWalletMsgOAuthInfoPass = {
  target: "oko_attached";
  msg_type: "oauth_info_pass";
  payload: OAuthPayload;
};

export type OkoWalletMsgOAuthInfoPassAck = {
  target: "oko_attached_popup";
  msg_type: "oauth_info_pass_ack";
  payload: null;
};

export type OkoWalletMsgSignOut = {
  target: "oko_attached";
  msg_type: "sign_out";
  payload: null;
};

export type OkoWalletMsgSignOutAck = {
  target: "oko_sdk";
  msg_type: "sign_out_ack";
  payload: Result<null, string>;
};

export type OkoWalletMsgOpenModal = {
  target: "oko_attached";
  msg_type: "open_modal";
  payload: OpenModalPayload;
};

export type OkoWalletMsgOpenModalAck = {
  target: "oko_sdk";
  msg_type: "open_modal_ack";
  payload: OpenModalAckPayload;
};

export type OkoWalletMsgHideModal = {
  target: "oko_attached";
  msg_type: "hide_modal";
  payload: null;
};

export type OkoWalletMsgHideModalAck = {
  target: "oko_sdk";
  msg_type: "hide_modal_ack";
  payload: Result<null, string>;
};

export type OkoWalletMsgInit = {
  target: "oko_sdk";
  msg_type: "init";
  payload: Result<InitPayload, string>;
};

export type OkoWalletMsgInitAck = {
  target: "oko_attached";
  msg_type: "init_ack";
  payload: Result<null, string>;
};

export type OkoWalletMsgGetEmail = {
  target: "oko_attached";
  msg_type: "get_email";
  payload: null;
};

export type OkoWalletMsgGetEmailAck = {
  target: "oko_sdk";
  msg_type: "get_email_ack";
  payload: Result<string, string>;
};

export type OkoWalletMsgGetCosmosChainInfo = {
  target: "oko_attached";
  msg_type: "get_cosmos_chain_info";
  payload: {
    chain_id: string | null;
  };
};

export type OkoWalletMsgGetCosmosChainInfoAck = {
  target: "oko_sdk";
  msg_type: "get_cosmos_chain_info_ack";
  payload: Result<ChainInfo[], string>;
};

export type OkoWalletMsgGetEthChainInfo = {
  target: "oko_attached";
  msg_type: "get_eth_chain_info";
  payload: {
    chain_id: string | null;
  };
};

export type OkoWalletMsgGetEthChainInfoAck = {
  target: "oko_sdk";
  msg_type: "get_eth_chain_info_ack";
  payload: Result<ChainInfo[], string>;
};

export type OkoWalletMsgImportPrivateKey = {
  target: "oko_attached";
  msg_type: "import_private_key";
  payload: OAuthPayload;
};

export type OkoWalletMsgImportPrivateKeyAck = {
  target: "oko_sdk";
  msg_type: "import_private_key_ack";
  payload: Result<Bytes32, string>;
};

export type OkoWalletMsg =
  | OkoWalletMsgInit
  | OkoWalletMsgInitAck
  | OkoWalletMsgGetPublicKey
  | OkoWalletMsgGetPublicKeyAck
  | OkoWalletMsgSetOAuthNonce
  | OkoWalletMsgSetOAuthNonceAck
  | OkoWalletMsgOAuthSignInUpdate
  | OkoWalletMsgOAuthSignInUpdateAck
  | OkoWalletMsgOAuthInfoPass
  | OkoWalletMsgOAuthInfoPassAck
  | OkoWalletMsgSignOut
  | OkoWalletMsgSignOutAck
  | OkoWalletMsgOpenModal
  | OkoWalletMsgOpenModalAck
  | OkoWalletMsgHideModal
  | OkoWalletMsgHideModalAck
  | OkoWalletMsgGetEmail
  | OkoWalletMsgGetEmailAck
  | OkoWalletMsgGetCosmosChainInfo
  | OkoWalletMsgGetCosmosChainInfoAck
  | OkoWalletMsgGetEthChainInfo
  | OkoWalletMsgGetEthChainInfoAck
  | OkoWalletMsgImportPrivateKey
  | OkoWalletMsgImportPrivateKeyAck
  | {
      target: "oko_sdk";
      msg_type: "unknown_msg_type";
      payload: string | null;
    };
