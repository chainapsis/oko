import {
  getTssSessionById,
  updateTssSessionState,
} from "@oko-wallet/oko-pg-interface/tss";
import {
  type AbortTssSessionRequest,
  type AbortTssSessionResponse,
  TssSessionState,
} from "@oko-wallet/oko-types/tss";
import { Pool } from "pg";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";

import { validateWalletEmailAndCurveType } from "@oko-wallet-tss-api/api/utils";

export async function abortTssSession(
  db: Pool,
  abortTssSessionRequest: AbortTssSessionRequest,
): Promise<OkoApiResponse<AbortTssSessionResponse>> {
  try {
    const { email, wallet_id, session_id } = abortTssSessionRequest;

    const validateWalletEmailAndCurveTypeRes =
      await validateWalletEmailAndCurveType(db, wallet_id, email, "secp256k1");
    if (validateWalletEmailAndCurveTypeRes.success === false) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        msg: validateWalletEmailAndCurveTypeRes.err,
      };
    }

    const getTssSessionRes = await getTssSessionById(db, session_id);
    if (getTssSessionRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `getTssSession error: ${getTssSessionRes.err}`,
      };
    }
    const tssSession = getTssSessionRes.data;
    if (tssSession === null) {
      return {
        success: false,
        code: "TSS_SESSION_NOT_FOUND",
        msg: `Tss session not found: ${session_id}`,
      };
    }

    if (
      tssSession.state === TssSessionState.COMPLETED ||
      tssSession.state === TssSessionState.FAILED ||
      tssSession.wallet_id !== wallet_id
    ) {
      return {
        success: false,
        code: "INVALID_TSS_SESSION",
        msg: `Invalid tss session: ${session_id}`,
      };
    }

    const updateTssSessionRes = await updateTssSessionState(
      db,
      session_id,
      TssSessionState.ABORTED,
    );
    if (updateTssSessionRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `updateTssSessionState error: ${updateTssSessionRes.err}`,
      };
    }

    return {
      success: true,
      data: {
        session_id: session_id,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `abortTssSession error: ${err}`,
    };
  }
}
