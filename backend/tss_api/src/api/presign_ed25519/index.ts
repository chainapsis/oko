import {
  createTssSession,
  createTssStage,
} from "@oko-wallet/oko-pg-interface/tss";
import type {
  PresignEd25519Request,
  PresignEd25519Response,
  PresignEd25519StageData,
} from "@oko-wallet/oko-types/tss";
import {
  TssStageType,
  PresignEd25519StageStatus,
} from "@oko-wallet/oko-types/tss";
import type { TeddsaKeygenOutput } from "@oko-wallet/teddsa-interface";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { Pool } from "pg";
import { decryptDataAsync } from "@oko-wallet/crypto-js/node";
import { runSignRound1Ed25519 } from "@oko-wallet/teddsa-addon/src/server";

import { validateWalletEmail } from "@oko-wallet-tss-api/api/utils";

export async function runPresignEd25519(
  db: Pool,
  encryptionSecret: string,
  request: PresignEd25519Request,
): Promise<OkoApiResponse<PresignEd25519Response>> {
  try {
    const { email, wallet_id, customer_id } = request;

    const validateWalletEmailRes = await validateWalletEmail(
      db,
      wallet_id,
      email,
    );
    if (validateWalletEmailRes.success === false) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        msg: validateWalletEmailRes.err,
      };
    }
    const wallet = validateWalletEmailRes.data;

    if (wallet.curve_type !== "ed25519") {
      return {
        success: false,
        code: "INVALID_WALLET_TYPE",
        msg: `Wallet is not ed25519 type: ${wallet.curve_type}`,
      };
    }

    const encryptedShare = wallet.enc_tss_share.toString("utf-8");
    const decryptedShare = await decryptDataAsync(
      encryptedShare,
      encryptionSecret,
    );
    const keygenOutput: TeddsaKeygenOutput = JSON.parse(decryptedShare);

    // Generate nonces and commitments (Round 1 without message)
    const round1Result = runSignRound1Ed25519(
      new Uint8Array(keygenOutput.key_package),
    );

    // Create TSS session
    const sessionRes = await createTssSession(db, {
      customer_id,
      wallet_id,
    });
    if (!sessionRes.success) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to create TSS session: ${sessionRes.err}`,
      };
    }
    const session = sessionRes.data;

    // Create TSS stage with presign data (nonces stored for later use)
    const stageData: PresignEd25519StageData = {
      nonces: round1Result.nonces,
      identifier: round1Result.identifier,
      commitments: round1Result.commitments,
    };

    const stageRes = await createTssStage(db, {
      session_id: session.session_id,
      stage_type: TssStageType.PRESIGN_ED25519,
      stage_status: PresignEd25519StageStatus.COMPLETED,
      stage_data: stageData,
    });
    if (!stageRes.success) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to create TSS stage: ${stageRes.err}`,
      };
    }

    return {
      success: true,
      data: {
        session_id: session.session_id,
        commitments_0: {
          identifier: round1Result.identifier,
          commitments: round1Result.commitments,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `runPresignEd25519 error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
