/**
 * Commit-Reveal Session Types
 */

import type { Bytes32 } from "@oko-wallet/bytes";

// ============================================================================
// Session Types
// ============================================================================

export type SessionType = "OAUTH_COMMIT_REVEAL";

export type CommitRevealSessionState =
  | "INITIALIZED"
  | "COMMIT_PHASE"
  | "COMMITTED"
  | "REVEAL_PHASE"
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "ROLLED_BACK";

export type OperationType = "signin" | "register" | "reshare";

export type RollbackReason =
  | "TIMEOUT"
  | "COMMIT_FAILED"
  | "REVEAL_FAILED"
  | "USER_CANCELLED"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR";

export type NodeOperationStatus = "PENDING" | "SUCCESS" | "FAILED";

// ============================================================================
// Data Structures
// ============================================================================

export interface NodeStatus {
  node_name: string;
  node_url: string;
  status: NodeOperationStatus;
  error_message?: string;
  timestamp: Date;
}

export interface EncryptedToken {
  ciphertext: string;
  nonce: string;
  tag: string;
}

// ============================================================================
// Session
// ============================================================================

export interface CommitRevealSession {
  session_id: string;
  session_type: SessionType;
  client_public_key: Bytes32;
  oko_server_public_key?: Bytes32;
  sdk_version: string;

  user_email: string;
  public_key: string; // wallet public key (hex)

  token_hash: string;

  state: CommitRevealSessionState;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;

  commit_phase: {
    nodes_committed: NodeStatus[];
    total_nodes: number;
    encrypted_tokens: Record<string, EncryptedToken>;
    node_public_keys: Record<string, Bytes32>;
  };

  reveal_phase: {
    nodes_revealed: NodeStatus[];
    total_nodes: number;
  };

  operation_type: OperationType;
  rollback_reason?: RollbackReason;
}

// ============================================================================
// API Types
// ============================================================================

export interface InitSessionRequest {
  session_id: string;
  session_type: SessionType;
  client_public_key: string; // hex
  public_key: string; // wallet public key hex
  token_hash: string;
  sdk_version: string;
  operation_type: OperationType;
  node_urls: string[];
}

export interface InitSessionResponse {
  success: boolean;
  data: {
    session_id: string;
    expires_at: string;
    state: CommitRevealSessionState;
    oko_server_public_key: string; // hex
  };
}

export interface CommitRequest {
  session_id: string;
  client_public_key: string;
  public_key: string;
  token_hash: string;
  sdk_version: string;
  operation_type: OperationType;
}

export interface CommitResponse {
  success: boolean;
  data: {
    session_id: string;
    node_public_key: string;
    state: "COMMITTED";
  };
}

// ============================================================================
// Session Creation
// ============================================================================

export interface CreateSessionOptions {
  oauth_token: string;
  user_email: string;
  wallet_public_key: string;
  operation_type: OperationType;
  node_urls: string[];
  sdk_version: string;
}
