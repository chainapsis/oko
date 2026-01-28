import type { Request, Response, NextFunction } from "express";
import type { KSNodeApiErrorResponse } from "@oko-wallet/ksn-interface/response";
import { Bytes } from "@oko-wallet/bytes";
import { verifySignature } from "@oko-wallet/crypto-js/node/ecdhe";
import { sha256 } from "@oko-wallet/crypto-js";
import {
  getCommitRevealSessionBySessionId,
  createCommitRevealApiCall,
} from "@oko-wallet/ksn-pg-interface/commit_reveal";

import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";
import { isApiAllowed } from "@oko-wallet-ksn-server/commit_reveal";
import type { ServerState } from "@oko-wallet-ksn-server/state";

export interface CommitRevealBody {
  cr_session_id: string;
  cr_signature: string; // 128 chars hex (64 bytes)
  auth_type?: string;
}

export interface CommitRevealLocals {
  cr_session_id: string;
}

export function commitRevealMiddleware(apiName: string) {
  return async (
    req: Request<any, any, CommitRevealBody>,
    res: Response<KSNodeApiErrorResponse, CommitRevealLocals>,
    next: NextFunction,
  ) => {
    const state = req.app.locals as ServerState;
    const { cr_session_id, cr_signature } = req.body;

    if (!cr_session_id || !cr_signature) {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: "cr_session_id and cr_signature are required",
      });
      return;
    }

    // Get session from DB
    const sessionResult = await getCommitRevealSessionBySessionId(
      state.db,
      cr_session_id,
    );
    if (!sessionResult.success) {
      res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get session: ${sessionResult.err}`,
      });
      return;
    }

    const session = sessionResult.data;
    if (!session) {
      res.status(ErrorCodeMap.SESSION_NOT_FOUND).json({
        success: false,
        code: "SESSION_NOT_FOUND",
        msg: "Session not found",
      });
      return;
    }

    if (session.state !== "COMMITTED") {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: `Session is not in COMMITTED state: ${session.state}`,
      });
      return;
    }

    if (new Date() > session.expires_at) {
      res.status(ErrorCodeMap.SESSION_EXPIRED).json({
        success: false,
        code: "SESSION_EXPIRED",
        msg: "Session has expired",
      });
      return;
    }

    if (!isApiAllowed(session.operation_type, apiName)) {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: `API "${apiName}" is not allowed for operation "${session.operation_type}"`,
      });
      return;
    }

    const signatureRes = Bytes.fromHexString(cr_signature, 64);
    if (!signatureRes.success) {
      res.status(ErrorCodeMap.INVALID_SIGNATURE).json({
        success: false,
        code: "INVALID_SIGNATURE",
        msg: `Invalid signature format: ${signatureRes.err}`,
      });
      return;
    }

    const clientPubkeyRes = Bytes.fromUint8Array(
      session.client_ephemeral_pubkey,
      32,
    );
    if (!clientPubkeyRes.success) {
      res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to parse client pubkey: ${clientPubkeyRes.err}`,
      });
      return;
    }

    // Get auth_type and id_token from request
    const authType = req.body.auth_type ?? "google";
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        msg: "Authorization header with Bearer token required",
      });
      return;
    }
    const idToken = authHeader.substring(7).trim();

    // Verify id_token_hash matches committed hash
    const computedHashRes = sha256(`${authType}${idToken}`);
    if (!computedHashRes.success) {
      res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to compute id_token_hash: ${computedHashRes.err}`,
      });
      return;
    }
    const computedHash = computedHashRes.data.toHex();
    if (computedHash !== session.id_token_hash) {
      res.status(400).json({
        success: false,
        code: "INVALID_REQUEST",
        msg: "id_token_hash mismatch: token does not match committed session",
      });
      return;
    }

    // Verify signature: message = node_pubkey + session_id + auth_type + id_token + operation_type + api_name
    const nodePubkeyHex = state.serverKeypair.publicKey.toHex();
    const message = `${nodePubkeyHex}${cr_session_id}${authType}${idToken}${session.operation_type}${apiName}`;
    const rBytes = Bytes.fromUint8Array(
      signatureRes.data.toUint8Array().slice(0, 32),
      32,
    );
    const sBytes = Bytes.fromUint8Array(
      signatureRes.data.toUint8Array().slice(32, 64),
      32,
    );
    if (!rBytes.success || !sBytes.success) {
      res.status(ErrorCodeMap.INVALID_SIGNATURE).json({
        success: false,
        code: "INVALID_SIGNATURE",
        msg: "Failed to parse signature components",
      });
      return;
    }

    const verifyResult = verifySignature(
      message,
      { r: rBytes.data, s: sBytes.data },
      clientPubkeyRes.data,
    );
    if (!verifyResult.success) {
      res.status(ErrorCodeMap.INVALID_SIGNATURE).json({
        success: false,
        code: "INVALID_SIGNATURE",
        msg: `Signature verification failed: ${verifyResult.err}`,
      });
      return;
    }
    if (!verifyResult.data) {
      res.status(ErrorCodeMap.INVALID_SIGNATURE).json({
        success: false,
        code: "INVALID_SIGNATURE",
        msg: "Invalid signature",
      });
      return;
    }

    const recordResult = await createCommitRevealApiCall(
      state.db,
      cr_session_id,
      apiName,
      signatureRes.data.toUint8Array(),
    );
    if (!recordResult.success) {
      if (recordResult.err.includes("duplicate key")) {
        res.status(409).json({
          success: false,
          code: "INVALID_REQUEST",
          msg: "This API has already been called for this session or signature was reused",
        });
        return;
      }
      res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to record API call: ${recordResult.err}`,
      });
      return;
    }

    res.locals.cr_session_id = cr_session_id;

    next();
  };
}
