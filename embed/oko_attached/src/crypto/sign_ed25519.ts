import {
  teddsaSignRound1,
  teddsaSignRound2,
  teddsaAggregate,
} from "@oko-wallet/teddsa-hooks";
import type {
  TeddsaCommitmentEntry,
  TeddsaSignatureShareEntry,
} from "@oko-wallet/teddsa-interface";
import type { Result } from "@oko-wallet/stdlib-js";
import type { MakeSignOutputError } from "@oko-wallet/oko-sdk-core";
import { reqPresignEd25519, reqSignEd25519 } from "@oko-wallet/teddsa-api-lib";

import { TSS_V1_ENDPOINT } from "@oko-wallet-attached/requests/oko_api";

export interface KeyPackageEd25519 {
  keyPackage: Uint8Array;
  publicKeyPackage: Uint8Array;
  identifier: Uint8Array;
}

/**
 * Ed25519 signing using presign flow.
 *
 * Flow:
 * 1. Server presign: Generate server nonces/commitments (requires apiKey)
 * 2. Client round1: Generate client nonces/commitments
 * 3. Server sign: Generate server signature share using presign (no apiKey needed)
 * 4. Client round2: Generate client signature share
 * 5. Aggregate: Combine signature shares into final signature
 */
export async function makeSignOutputEd25519(
  message: Uint8Array,
  keyPackage: KeyPackageEd25519,
  apiKey: string,
  authToken: string,
  getIsAborted: () => boolean,
): Promise<Result<Uint8Array, MakeSignOutputError>> {
  try {
    if (getIsAborted()) {
      return { success: false, err: { type: "aborted" } };
    }

    // 1. Server presign: Get server commitments (requires apiKey for session creation)
    const presignRes = await reqPresignEd25519(
      TSS_V1_ENDPOINT,
      {},
      apiKey,
      authToken,
    );

    if (!presignRes.success) {
      return {
        success: false,
        err: {
          type: "sign_fail",
          error: { type: "error", msg: presignRes.msg },
        },
      };
    }

    const { session_id: sessionId, commitments_0: serverCommitment } =
      presignRes.data;

    if (getIsAborted()) {
      return { success: false, err: { type: "aborted" } };
    }

    // 2. Client round1: Generate client nonces and commitments
    const round1Result = teddsaSignRound1(keyPackage.keyPackage);
    if (!round1Result.success) {
      return {
        success: false,
        err: {
          type: "sign_fail",
          error: { type: "error", msg: round1Result.err },
        },
      };
    }

    const clientCommitment: TeddsaCommitmentEntry = {
      identifier: round1Result.data.identifier,
      commitments: round1Result.data.commitments,
    };

    const allCommitments: TeddsaCommitmentEntry[] = [
      clientCommitment,
      serverCommitment,
    ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

    if (getIsAborted()) {
      return { success: false, err: { type: "aborted" } };
    }

    // 3. Server sign: Get server signature share using presign session (no apiKey needed)
    const serverSignRes = await reqSignEd25519(
      TSS_V1_ENDPOINT,
      {
        session_id: sessionId,
        msg: [...message],
        commitments_1: clientCommitment,
      },
      authToken,
    );

    if (!serverSignRes.success) {
      return {
        success: false,
        err: {
          type: "sign_fail",
          error: { type: "error", msg: serverSignRes.msg },
        },
      };
    }

    const serverSignatureShare: TeddsaSignatureShareEntry =
      serverSignRes.data.signature_share_0;

    if (getIsAborted()) {
      return { success: false, err: { type: "aborted" } };
    }

    // 4. Client round2: Generate client signature share
    const round2Result = teddsaSignRound2(
      message,
      keyPackage.keyPackage,
      new Uint8Array(round1Result.data.nonces),
      allCommitments,
    );

    if (!round2Result.success) {
      return {
        success: false,
        err: {
          type: "sign_fail",
          error: { type: "error", msg: round2Result.err },
        },
      };
    }

    const clientSignatureShare: TeddsaSignatureShareEntry = {
      identifier: round2Result.data.identifier,
      signature_share: round2Result.data.signature_share,
    };

    const allSignatureShares: TeddsaSignatureShareEntry[] = [
      clientSignatureShare,
      serverSignatureShare,
    ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

    // 5. Aggregate: Combine signature shares into final signature
    const aggregateResult = teddsaAggregate(
      message,
      allCommitments,
      allSignatureShares,
      keyPackage.publicKeyPackage,
    );

    if (!aggregateResult.success) {
      return {
        success: false,
        err: {
          type: "sign_fail",
          error: { type: "error", msg: aggregateResult.err },
        },
      };
    }

    return { success: true, data: aggregateResult.data };
  } catch (error) {
    return {
      success: false,
      err: {
        type: "sign_fail",
        error: {
          type: "error",
          msg: error instanceof Error ? error.message : String(error),
        },
      },
    };
  }
}
