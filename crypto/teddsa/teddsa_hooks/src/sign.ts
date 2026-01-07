import { wasmModule } from "@oko-wallet/frost-ed25519-keplr-wasm";
import type { Result } from "@oko-wallet/stdlib-js";
import type {
  SigningCommitmentOutput,
  SignatureShareOutput,
  SignatureOutput,
  CommitmentEntry,
  SignatureShareEntry,
  KeyPackageRaw,
  PublicKeyPackageRaw,
} from "@oko-wallet/teddsa-interface";

import type { TeddsaKeygenOutputBytes } from "./types";

export type TeddsaSignError =
  | { type: "aborted" }
  | { type: "error"; msg: string };

function serializeKeyPackage(pkg: KeyPackageRaw): number[] {
  const result: number[] = [];
  result.push(...pkg.identifier);
  result.push(...pkg.signing_share);
  result.push(...pkg.verifying_share);
  result.push(...pkg.verifying_key);
  result.push(pkg.min_signers & 0xff);
  result.push((pkg.min_signers >> 8) & 0xff);
  return result;
}

function serializePublicKeyPackage(pkg: PublicKeyPackageRaw): number[] {
  const json = JSON.stringify(pkg);
  return Array.from(new TextEncoder().encode(json));
}

export function teddsaSignRound1(
  keyPackage: KeyPackageRaw,
): Result<SigningCommitmentOutput, string> {
  try {
    const serialized = serializeKeyPackage(keyPackage);
    const result: SigningCommitmentOutput =
      wasmModule.cli_sign_round1_ed25519(serialized);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

export function teddsaSignRound2(
  message: Uint8Array,
  keyPackage: KeyPackageRaw,
  nonces: Uint8Array,
  allCommitments: CommitmentEntry[],
): Result<SignatureShareOutput, string> {
  try {
    const input = {
      message: [...message],
      key_package: serializeKeyPackage(keyPackage),
      nonces: [...nonces],
      all_commitments: allCommitments,
    };
    const result: SignatureShareOutput =
      wasmModule.cli_sign_round2_ed25519(input);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

export function teddsaAggregate(
  message: Uint8Array,
  allCommitments: CommitmentEntry[],
  allSignatureShares: SignatureShareEntry[],
  publicKeyPackage: PublicKeyPackageRaw,
): Result<Uint8Array, string> {
  try {
    const input = {
      message: [...message],
      all_commitments: allCommitments,
      all_signature_shares: allSignatureShares,
      public_key_package: serializePublicKeyPackage(publicKeyPackage),
    };
    const result: SignatureOutput = wasmModule.cli_aggregate_ed25519(input);
    return { success: true, data: new Uint8Array(result.signature) };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

export function teddsaVerify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKeyPackage: PublicKeyPackageRaw,
): Result<boolean, string> {
  try {
    const input = {
      message: [...message],
      signature: [...signature],
      public_key_package: serializePublicKeyPackage(publicKeyPackage),
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
