import {
  createTssSession,
  createTssStage,
  getTssStageWithSessionData,
} from "@oko-wallet/oko-pg-interface/tss";
import type {
  SignEd25519Round1Request,
  SignEd25519Round1Response,
  SignEd25519Round2Request,
  SignEd25519Round2Response,
  SignEd25519AggregateRequest,
  SignEd25519AggregateResponse,
  SignEd25519StageData,
  SignEd25519Request,
  SignEd25519Response,
  PresignEd25519StageData,
} from "@oko-wallet/oko-types/tss";
import {
  TssStageType,
  SignEd25519StageStatus,
  PresignEd25519StageStatus,
  TssSessionState,
} from "@oko-wallet/oko-types/tss";
import type { TeddsaKeygenOutput } from "@oko-wallet/teddsa-interface";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { Pool } from "pg";
import { decryptDataAsync } from "@oko-wallet/crypto-js/node";
import {
  runSignRound1Ed25519,
  runSignRound2Ed25519,
  runAggregateEd25519,
} from "@oko-wallet/teddsa-addon/src/server";

import {
  validateWalletEmail,
  validateTssSession,
  validateTssStage,
  updateTssStageWithSessionState,
} from "@oko-wallet-tss-api/api/utils";

export async function runSignEd25519Round1(
  db: Pool,
  encryptionSecret: string,
  request: SignEd25519Round1Request,
): Promise<OkoApiResponse<SignEd25519Round1Response>> {
  try {
    const { email, wallet_id, customer_id, msg } = request;

    const validateWalletEmailRes = await validateWalletEmail(db, wallet_id, email);
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

    // Create TSS stage with round1 data
    const stageData: SignEd25519StageData = {
      nonces: round1Result.nonces,
      identifier: round1Result.identifier,
      commitments: round1Result.commitments,
      signature_share: null,
      signature: null,
    };

    const stageRes = await createTssStage(db, {
      session_id: session.session_id,
      stage_type: TssStageType.SIGN_ED25519,
      stage_status: SignEd25519StageStatus.ROUND_1,
      stage_data: {
        ...stageData,
        msg, // Store the message for round2
      },
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
      msg: `runSignEd25519Round1 error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function runSignEd25519Round2(
  db: Pool,
  encryptionSecret: string,
  request: SignEd25519Round2Request,
): Promise<OkoApiResponse<SignEd25519Round2Response>> {
  try {
    const { email, wallet_id, session_id, commitments_1 } = request;

    const validateWalletEmailRes = await validateWalletEmail(db, wallet_id, email);
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

    // Get stage with session data
    const getStageRes = await getTssStageWithSessionData(
      db,
      session_id,
      TssStageType.SIGN_ED25519,
    );
    if (getStageRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get TSS stage: ${getStageRes.err}`,
      };
    }
    const stage = getStageRes.data;

    // Validate session
    if (!validateTssSession(stage, wallet_id)) {
      return {
        success: false,
        code: "INVALID_TSS_SESSION",
        msg: "Invalid session state or wallet mismatch",
      };
    }

    // Validate stage status
    if (!validateTssStage(stage, SignEd25519StageStatus.ROUND_1)) {
      return {
        success: false,
        code: "INVALID_TSS_SESSION",
        msg: "Round 1 state not found. Please call round1 first.",
      };
    }

    const stageData = stage.stage_data as SignEd25519StageData & { msg: number[] };
    const { nonces, identifier, msg } = stageData;

    if (!nonces || !identifier || !msg) {
      return {
        success: false,
        code: "INVALID_TSS_SESSION",
        msg: "Missing round1 data in stage",
      };
    }

    const encryptedShare = wallet.enc_tss_share.toString("utf-8");
    const decryptedShare = await decryptDataAsync(
      encryptedShare,
      encryptionSecret,
    );
    const keygenOutput: TeddsaKeygenOutput = JSON.parse(decryptedShare);

    const serverCommitment = {
      identifier,
      commitments: stageData.commitments!,
    };

    const allCommitments = [serverCommitment, commitments_1];
    allCommitments.sort((a, b) => {
      const idA = a.identifier[0] ?? 0;
      const idB = b.identifier[0] ?? 0;
      return idA - idB;
    });

    const round2Result = runSignRound2Ed25519(
      new Uint8Array(msg),
      new Uint8Array(keygenOutput.key_package),
      new Uint8Array(nonces),
      allCommitments,
    );

    // Update stage and session atomically
    const updateRes = await updateTssStageWithSessionState(
      db,
      stage.stage_id,
      session_id,
      {
        stage_status: SignEd25519StageStatus.COMPLETED,
        stage_data: {
          ...stageData,
          signature_share: round2Result.signature_share,
        },
      },
      TssSessionState.COMPLETED,
    );
    if (!updateRes.success) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to update TSS stage: ${updateRes.err}`,
      };
    }

    return {
      success: true,
      data: {
        signature_share_0: {
          identifier: round2Result.identifier,
          signature_share: round2Result.signature_share,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `runSignEd25519Round2 error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// New presign-based sign function
export async function runSignEd25519(
  db: Pool,
  encryptionSecret: string,
  request: SignEd25519Request,
): Promise<OkoApiResponse<SignEd25519Response>> {
  try {
    const { email, wallet_id, session_id, msg, commitments_1 } = request;

    const validateWalletEmailRes = await validateWalletEmail(db, wallet_id, email);
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

    // Get presign stage with session data
    const getStageRes = await getTssStageWithSessionData(
      db,
      session_id,
      TssStageType.PRESIGN_ED25519,
    );
    if (getStageRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get TSS stage: ${getStageRes.err}`,
      };
    }
    const stage = getStageRes.data;

    // Validate session
    if (!validateTssSession(stage, wallet_id)) {
      return {
        success: false,
        code: "INVALID_TSS_SESSION",
        msg: "Invalid session state or wallet mismatch",
      };
    }

    // Validate stage status (must be COMPLETED presign, not USED)
    if (!validateTssStage(stage, PresignEd25519StageStatus.COMPLETED)) {
      return {
        success: false,
        code: "INVALID_TSS_SESSION",
        msg: "Presign not found or already used. Please call presign_ed25519 first.",
      };
    }

    const stageData = stage.stage_data as PresignEd25519StageData;
    const { nonces, identifier, commitments } = stageData;

    if (!nonces || !identifier || !commitments) {
      return {
        success: false,
        code: "INVALID_TSS_SESSION",
        msg: "Missing presign data in stage",
      };
    }

    const encryptedShare = wallet.enc_tss_share.toString("utf-8");
    const decryptedShare = await decryptDataAsync(
      encryptedShare,
      encryptionSecret,
    );
    const keygenOutput: TeddsaKeygenOutput = JSON.parse(decryptedShare);

    const serverCommitment = {
      identifier,
      commitments,
    };

    const allCommitments = [serverCommitment, commitments_1];
    allCommitments.sort((a, b) => {
      const idA = a.identifier[0] ?? 0;
      const idB = b.identifier[0] ?? 0;
      return idA - idB;
    });

    const round2Result = runSignRound2Ed25519(
      new Uint8Array(msg),
      new Uint8Array(keygenOutput.key_package),
      new Uint8Array(nonces),
      allCommitments,
    );

    // Mark presign as USED and complete the session
    const updateRes = await updateTssStageWithSessionState(
      db,
      stage.stage_id,
      session_id,
      {
        stage_status: PresignEd25519StageStatus.USED,
        stage_data: stageData,
      },
      TssSessionState.COMPLETED,
    );
    if (!updateRes.success) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to update TSS stage: ${updateRes.err}`,
      };
    }

    return {
      success: true,
      data: {
        signature_share_0: {
          identifier: round2Result.identifier,
          signature_share: round2Result.signature_share,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `runSignEd25519 error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function runSignEd25519Aggregate(
  db: Pool,
  encryptionSecret: string,
  request: SignEd25519AggregateRequest,
): Promise<OkoApiResponse<SignEd25519AggregateResponse>> {
  try {
    const { email, wallet_id, msg, all_commitments, all_signature_shares } =
      request;

    const validateWalletEmailRes = await validateWalletEmail(db, wallet_id, email);
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

    const aggregateResult = runAggregateEd25519(
      new Uint8Array(msg),
      all_commitments,
      all_signature_shares,
      new Uint8Array(keygenOutput.public_key_package),
    );

    return {
      success: true,
      data: {
        signature: aggregateResult.signature,
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `runSignEd25519Aggregate error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
