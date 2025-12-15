import type { NodeNameAndEndpoint } from "../user_key_share";
import type { KeyShareNodeMetaWithNodeStatusInfo } from "../tss/ks_node";
import type { OAuthRequest } from "../auth";

export interface User {
  user_id: string;
  email: string;
  status: string;
  auth_type: AuthType;
  created_at: Date;
  updated_at: Date;
}

export type AuthType = "google" | "auth0" | "x" | "telegram" | "discord";

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

export interface SignInResponse {
  token: string;
  user: {
    email: string;
    wallet_id: string;
    public_key: string;
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
export type ReshareReason =
  | "UNRECOVERABLE_NODE_DATA_LOSS"
  | "NEW_NODE_ADDED"
  // @TODO remove fields
  | "NODE_REMOVED"
  | "NODE_SET_MISMATCH"; // When both NEW_NODE_ADDED and NODE_REMOVED occur simultaneously

export interface ReshareRequest {
  public_key: string;
  reshared_key_shares: NodeNameAndEndpoint[];
}

export type ReshareRequestBody = OAuthRequest<ReshareRequest>;
