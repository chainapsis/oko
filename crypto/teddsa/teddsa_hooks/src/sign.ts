import { wasmModule } from "@oko-wallet/teddsa-wasm";
import type { Result } from "@oko-wallet/stdlib-js";
import type {
  TeddsaSignRound1Output,
  TeddsaSignRound2Output,
  TeddsaAggregateOutput,
  TeddsaCommitmentEntry,
  TeddsaSignatureShareEntry,
} from "@oko-wallet/teddsa-interface";

import type { TeddsaKeygenOutputBytes } from "./types";

export type TeddsaSignError =
  | { type: "aborted" }
  | { type: "error"; msg: string };

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

export function teddsaSignRound2(
  message: Uint8Array,
  keyPackage: Uint8Array,
  nonces: Uint8Array,
  allCommitments: TeddsaCommitmentEntry[],
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

export function teddsaAggregate(
  message: Uint8Array,
  allCommitments: TeddsaCommitmentEntry[],
  allSignatureShares: TeddsaSignatureShareEntry[],
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

export async function runTeddsaSignLocal(
  message: Uint8Array,
  keygen1: TeddsaKeygenOutputBytes,
  keygen2: TeddsaKeygenOutputBytes,
): Promise<Result<Uint8Array, TeddsaSignError>> {
  try {
    const round1_1 = teddsaSignRound1(keygen1.key_package);
    if (!round1_1.success) {
      return { success: false, err: { type: "error", msg: round1_1.err } };
    }

    const round1_2 = teddsaSignRound1(keygen2.key_package);
    if (!round1_2.success) {
      return { success: false, err: { type: "error", msg: round1_2.err } };
    }

    const allCommitments: TeddsaCommitmentEntry[] = [
      {
        identifier: round1_1.data.identifier,
        commitments: round1_1.data.commitments,
      },
      {
        identifier: round1_2.data.identifier,
        commitments: round1_2.data.commitments,
      },
    ];

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

    const allSignatureShares: TeddsaSignatureShareEntry[] = [
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
