import type { AuthType, OAuthRequest } from "../auth";
import type { KeyShareNodeMetaWithNodeStatusInfo } from "../tss/ks_node";
import type { NodeNameAndEndpoint } from "../user_key_share";

export interface User {
  user_id: string;
  email: string;
  status: string;
  auth_type: AuthType;
  created_at: Date;
  updated_at: Date;
}

export interface CheckEmailRequest {
  email: string;
  auth_type?: AuthType;
}

export interface CheckEmailResponse {
  exists: boolean;
  keyshare_node_meta: KeyShareNodeMetaWithNodeStatusInfo;
  // Reshare signaling
  needs_reshare: boolean;
  reshare_reasons?: ReshareReason[];
  // Service-level signal when active nodes fall below SSS threshold
  active_nodes_below_threshold: boolean;
}

export interface WalletCheckInfo {
  keyshare_node_meta: KeyShareNodeMetaWithNodeStatusInfo;
  needs_reshare: boolean;
  reshare_reasons?: ReshareReason[];
  active_nodes_below_threshold: boolean;
}

/**
 * Response when user does not exist or user exists but has no wallets.
 * Returns global keyshare node metadata for signup flow.
 */
export interface CheckEmailResponseV2NotExists {
  exists: false;
  keyshare_node_meta: KeyShareNodeMetaWithNodeStatusInfo;
}

/**
 * Response when user exists with only secp256k1 wallet (legacy user).
 * Indicates that ed25519 keygen is required for full wallet setup.
 */
export interface CheckEmailResponseV2NeedsEd25519Keygen {
  exists: true;
  needs_keygen_ed25519: true;
  secp256k1: WalletCheckInfo;
}

/**
 * Response when user exists with both secp256k1 and ed25519 wallets.
 * Returns reshare status for each wallet type.
 */
export interface CheckEmailResponseV2BothWallets {
  exists: true;
  secp256k1: WalletCheckInfo;
  ed25519: WalletCheckInfo;
}

export type CheckEmailResponseV2 =
  | CheckEmailResponseV2NotExists
  | CheckEmailResponseV2NeedsEd25519Keygen
  | CheckEmailResponseV2BothWallets;

export interface SignInResponse {
  token: string;
  user: {
    wallet_id: string;
    public_key: string;
    user_identifier: string;
    email: string | null;
    name: string | null;
  };
}

export interface SignInResponseV2 {
  token: string;
  user: {
    wallet_id_secp256k1: string;
    wallet_id_ed25519: string;
    public_key_secp256k1: string;
    public_key_ed25519: string;
    user_identifier: string;
    email: string | null;
    name: string | null;
  };
}

export interface SignInSilentlyResponse {
  token: string | null;
  // user: {
  //   email: string;
  //   wallet_id: string;
  //   public_key: string;
  // };
}

// Reason codes for triggering reshare
export type ReshareReason = "UNRECOVERABLE_NODE_DATA_LOSS" | "NEW_NODE_ADDED";

export interface ReshareRequest {
  public_key: string;
  reshared_key_shares: NodeNameAndEndpoint[];
}

export type ReshareRequestBody = OAuthRequest<ReshareRequest>;
