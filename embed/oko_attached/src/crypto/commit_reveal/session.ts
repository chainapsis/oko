/**
 * Commit-Reveal Session Management
 */

import type { Bytes32 } from "@oko-wallet/bytes";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  CommitRevealSession,
  CommitRevealSessionState,
  CreateSessionOptions,
  NodeStatus,
  EncryptedToken,
} from "./types";
import type { ClientEcdheKeypair } from "./utils";
import {
  generateSessionId,
  generateClientKeypair,
  calculateTokenHash,
  calculateExpiresAt,
  isSessionExpired,
} from "./utils";

// ============================================================================
// Session Creation
// ============================================================================

export interface CreateSessionResult {
  session: CommitRevealSession;
  keypair: ClientEcdheKeypair;
}

/**
 * Create a new commit-reveal session.
 */
export function createSession(
  options: CreateSessionOptions,
): Result<CreateSessionResult, string> {
  const sessionId = generateSessionId();

  const keypairResult = generateClientKeypair();
  if (!keypairResult.success) {
    return { success: false, err: keypairResult.err };
  }

  const tokenHashResult = calculateTokenHash(
    options.oauth_token,
    options.sdk_version,
  );
  if (!tokenHashResult.success) {
    return { success: false, err: tokenHashResult.err };
  }

  const now = new Date();

  const session: CommitRevealSession = {
    session_id: sessionId,
    session_type: "OAUTH_COMMIT_REVEAL",
    client_public_key: keypairResult.data.publicKey,
    sdk_version: options.sdk_version,
    user_email: options.user_email,
    public_key: options.wallet_public_key,
    token_hash: tokenHashResult.data,
    state: "INITIALIZED",
    created_at: now,
    updated_at: now,
    expires_at: calculateExpiresAt(now),
    commit_phase: {
      nodes_committed: [],
      total_nodes: options.node_urls.length,
      encrypted_tokens: {},
      node_public_keys: {},
    },
    reveal_phase: {
      nodes_revealed: [],
      total_nodes: options.node_urls.length,
    },
    operation_type: options.operation_type,
  };

  return {
    success: true,
    data: { session, keypair: keypairResult.data },
  };
}

// ============================================================================
// State Management
// ============================================================================

/**
 * Update session state.
 */
export function updateState(
  session: CommitRevealSession,
  newState: CommitRevealSessionState,
): CommitRevealSession {
  return {
    ...session,
    state: newState,
    updated_at: new Date(),
  };
}

/**
 * Check if state transition is valid.
 */
export function canTransitionTo(
  session: CommitRevealSession,
  targetState: CommitRevealSessionState,
): boolean {
  if (isSessionExpired(session.expires_at)) {
    return targetState === "TIMEOUT";
  }

  const transitions: Record<
    CommitRevealSessionState,
    CommitRevealSessionState[]
  > = {
    INITIALIZED: ["COMMIT_PHASE", "FAILED", "TIMEOUT"],
    COMMIT_PHASE: ["COMMITTED", "FAILED", "TIMEOUT"],
    COMMITTED: ["REVEAL_PHASE", "FAILED", "TIMEOUT", "ROLLED_BACK"],
    REVEAL_PHASE: ["COMPLETED", "FAILED", "TIMEOUT", "ROLLED_BACK"],
    COMPLETED: [],
    FAILED: ["ROLLED_BACK"],
    TIMEOUT: ["ROLLED_BACK"],
    ROLLED_BACK: [],
  };

  return transitions[session.state]?.includes(targetState) ?? false;
}

// ============================================================================
// Commit Phase
// ============================================================================

/**
 * Record Oko Server's public key after init.
 */
export function setOkoServerPublicKey(
  session: CommitRevealSession,
  publicKey: Bytes32,
): CommitRevealSession {
  return {
    ...session,
    oko_server_public_key: publicKey,
    state: "COMMIT_PHASE",
    updated_at: new Date(),
  };
}

/**
 * Record successful node commit.
 */
export function recordNodeCommit(
  session: CommitRevealSession,
  nodeUrl: string,
  nodeName: string,
  nodePublicKey: Bytes32,
): CommitRevealSession {
  const status: NodeStatus = {
    node_name: nodeName,
    node_url: nodeUrl,
    status: "SUCCESS",
    timestamp: new Date(),
  };

  return {
    ...session,
    updated_at: new Date(),
    commit_phase: {
      ...session.commit_phase,
      nodes_committed: [...session.commit_phase.nodes_committed, status],
      node_public_keys: {
        ...session.commit_phase.node_public_keys,
        [nodeUrl]: nodePublicKey,
      },
    },
  };
}

/**
 * Record failed node commit.
 */
export function recordNodeCommitFailure(
  session: CommitRevealSession,
  nodeUrl: string,
  nodeName: string,
  errorMessage: string,
): CommitRevealSession {
  const status: NodeStatus = {
    node_name: nodeName,
    node_url: nodeUrl,
    status: "FAILED",
    error_message: errorMessage,
    timestamp: new Date(),
  };

  return {
    ...session,
    updated_at: new Date(),
    commit_phase: {
      ...session.commit_phase,
      nodes_committed: [...session.commit_phase.nodes_committed, status],
    },
  };
}

/**
 * Store encrypted token for a node.
 */
export function storeEncryptedToken(
  session: CommitRevealSession,
  nodeUrl: string,
  encryptedToken: EncryptedToken,
): CommitRevealSession {
  return {
    ...session,
    updated_at: new Date(),
    commit_phase: {
      ...session.commit_phase,
      encrypted_tokens: {
        ...session.commit_phase.encrypted_tokens,
        [nodeUrl]: encryptedToken,
      },
    },
  };
}

// ============================================================================
// Reveal Phase
// ============================================================================

/**
 * Record successful node reveal.
 */
export function recordNodeReveal(
  session: CommitRevealSession,
  nodeUrl: string,
  nodeName: string,
): CommitRevealSession {
  const status: NodeStatus = {
    node_name: nodeName,
    node_url: nodeUrl,
    status: "SUCCESS",
    timestamp: new Date(),
  };

  return {
    ...session,
    updated_at: new Date(),
    reveal_phase: {
      ...session.reveal_phase,
      nodes_revealed: [...session.reveal_phase.nodes_revealed, status],
    },
  };
}

/**
 * Record failed node reveal.
 */
export function recordNodeRevealFailure(
  session: CommitRevealSession,
  nodeUrl: string,
  nodeName: string,
  errorMessage: string,
): CommitRevealSession {
  const status: NodeStatus = {
    node_name: nodeName,
    node_url: nodeUrl,
    status: "FAILED",
    error_message: errorMessage,
    timestamp: new Date(),
  };

  return {
    ...session,
    updated_at: new Date(),
    reveal_phase: {
      ...session.reveal_phase,
      nodes_revealed: [...session.reveal_phase.nodes_revealed, status],
    },
  };
}

// ============================================================================
// Status Helpers
// ============================================================================

export function getSuccessfulCommitCount(session: CommitRevealSession): number {
  return session.commit_phase.nodes_committed.filter(
    (n) => n.status === "SUCCESS",
  ).length;
}

export function getSuccessfulRevealCount(session: CommitRevealSession): number {
  return session.reveal_phase.nodes_revealed.filter(
    (n) => n.status === "SUCCESS",
  ).length;
}

export function isCommitPhaseComplete(session: CommitRevealSession): boolean {
  return (
    session.commit_phase.nodes_committed.length ===
    session.commit_phase.total_nodes
  );
}

export function isRevealPhaseComplete(session: CommitRevealSession): boolean {
  return (
    session.reveal_phase.nodes_revealed.length ===
    session.reveal_phase.total_nodes
  );
}

export function meetsThreshold(
  session: CommitRevealSession,
  threshold: number,
): boolean {
  if (session.state === "COMMIT_PHASE" || session.state === "COMMITTED") {
    return getSuccessfulCommitCount(session) >= threshold;
  }
  if (session.state === "REVEAL_PHASE" || session.state === "COMPLETED") {
    return getSuccessfulRevealCount(session) >= threshold;
  }
  return false;
}
