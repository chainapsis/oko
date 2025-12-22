import { wasmModule } from "@oko-wallet/teddsa-wasm-mock";
import type { Result } from "@oko-wallet/stdlib-js";

import type {
  TeddsaSignRound1Output,
  TeddsaSignRound2Output,
  TeddsaAggregateOutput,
  CommitmentEntry,
  SignatureShareEntry,
  TeddsaKeygenOutputBytes,
} from "./types";

export type TeddsaSignError =
  | { type: "aborted" }
  | { type: "error"; msg: string };

/**
 * TEdDSA signing round 1: Generate nonces and commitments
 *
 * @param keyPackage - Participant's serialized KeyPackage
 * @returns Nonces (keep secret) and commitments (share with coordinator)
 */
export function teddsaSignRound1(
  keyPackage: Uint8Array,
): Result<TeddsaSignRound1Output, string> {
  try {
    const result: TeddsaSignRound1Output = wasmModule.cli_sign_round1_ed25519([
      ...keyPackage,
    ]);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

/**
 * TEdDSA signing round 2: Generate signature share
 *
 * @param message - Message to sign
 * @param keyPackage - Participant's serialized KeyPackage
 * @param nonces - Nonces from round 1
 * @param allCommitments - Commitments from all participants
 * @returns Signature share
 */
export function teddsaSignRound2(
  message: Uint8Array,
  keyPackage: Uint8Array,
  nonces: Uint8Array,
  allCommitments: CommitmentEntry[],
): Result<TeddsaSignRound2Output, string> {
  try {
    const input = {
      message: [...message],
      key_package: [...keyPackage],
      nonces: [...nonces],
      all_commitments: allCommitments,
    };
    const result: TeddsaSignRound2Output =
      wasmModule.cli_sign_round2_ed25519(input);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

/**
 * Aggregate signature shares into final Ed25519 signature
 *
 * @param message - Original message that was signed
 * @param allCommitments - Commitments from all participants
 * @param allSignatureShares - Signature shares from all participants
 * @param publicKeyPackage - Serialized PublicKeyPackage
 * @returns 64-byte Ed25519 signature
 */
export function teddsaAggregate(
  message: Uint8Array,
  allCommitments: CommitmentEntry[],
  allSignatureShares: SignatureShareEntry[],
  publicKeyPackage: Uint8Array,
): Result<Uint8Array, string> {
  try {
    const input = {
      message: [...message],
      all_commitments: allCommitments,
      all_signature_shares: allSignatureShares,
      public_key_package: [...publicKeyPackage],
    };
    const result: TeddsaAggregateOutput =
      wasmModule.cli_aggregate_ed25519(input);
    return { success: true, data: new Uint8Array(result.signature) };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

/**
 * Verify an Ed25519 signature
 *
 * @param message - Original message
 * @param signature - 64-byte Ed25519 signature
 * @param publicKeyPackage - Serialized PublicKeyPackage
 * @returns true if signature is valid
 */
export function teddsaVerify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKeyPackage: Uint8Array,
): Result<boolean, string> {
  try {
    const input = {
      message: [...message],
      signature: [...signature],
      public_key_package: [...publicKeyPackage],
    };
    const isValid: boolean = wasmModule.cli_verify_ed25519(input);
    return { success: true, data: isValid };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

/**
 * High-level function to run complete TEdDSA signing protocol locally (for testing)
 *
 * This function performs all signing rounds locally with both key shares.
 * In production, round 1 and round 2 would be distributed between client and server.
 *
 * @param message - Message to sign
 * @param keygen1 - First participant's keygen output
 * @param keygen2 - Second participant's keygen output
 * @returns 64-byte Ed25519 signature
 */
export async function runTeddsaSignLocal(
  message: Uint8Array,
  keygen1: TeddsaKeygenOutputBytes,
  keygen2: TeddsaKeygenOutputBytes,
): Promise<Result<Uint8Array, TeddsaSignError>> {
  try {
    // Round 1: Both participants generate commitments
    const round1_1 = teddsaSignRound1(keygen1.key_package);
    if (!round1_1.success) {
      return { success: false, err: { type: "error", msg: round1_1.err } };
    }

    const round1_2 = teddsaSignRound1(keygen2.key_package);
    if (!round1_2.success) {
      return { success: false, err: { type: "error", msg: round1_2.err } };
    }

    // Collect all commitments
    const allCommitments: CommitmentEntry[] = [
      {
        identifier: round1_1.data.identifier,
        commitments: round1_1.data.commitments,
      },
      {
        identifier: round1_2.data.identifier,
        commitments: round1_2.data.commitments,
      },
    ];

    // Round 2: Both participants generate signature shares
    const round2_1 = teddsaSignRound2(
      message,
      keygen1.key_package,
      new Uint8Array(round1_1.data.nonces),
      allCommitments,
    );
    if (!round2_1.success) {
      return { success: false, err: { type: "error", msg: round2_1.err } };
    }

    const round2_2 = teddsaSignRound2(
      message,
      keygen2.key_package,
      new Uint8Array(round1_2.data.nonces),
      allCommitments,
    );
    if (!round2_2.success) {
      return { success: false, err: { type: "error", msg: round2_2.err } };
    }

    // Aggregate signature shares
    const allSignatureShares: SignatureShareEntry[] = [
      {
        identifier: round2_1.data.identifier,
        signature_share: round2_1.data.signature_share,
      },
      {
        identifier: round2_2.data.identifier,
        signature_share: round2_2.data.signature_share,
      },
    ];

    const aggregateResult = teddsaAggregate(
      message,
      allCommitments,
      allSignatureShares,
      keygen1.public_key_package,
    );

    if (!aggregateResult.success) {
      return {
        success: false,
        err: { type: "error", msg: aggregateResult.err },
      };
    }

    return { success: true, data: aggregateResult.data };
  } catch (error: any) {
    return { success: false, err: { type: "error", msg: String(error) } };
  }
}
