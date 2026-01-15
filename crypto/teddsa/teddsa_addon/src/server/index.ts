// NOTE: NAPI addon returns serialized bytes, different from WASM Raw types
import type {
  CommitmentEntry,
  SignatureShareEntry,
} from "@oko-wallet/oko-types/teddsa";

import {
  napiKeygenCentralizedEd25519,
  napiKeygenImportEd25519,
  napiSignRound1Ed25519,
  napiSignRound2Ed25519,
  napiAggregateEd25519,
  napiVerifyEd25519,
  napiExtractKeyPackageSharesEd25519,
  napiReconstructKeyPackageEd25519,
  napiReconstructPublicKeyPackageEd25519,
} from "../../addon/index.js";

// NOTE: NAPI-specific types (serialized bytes format)
export interface NapiKeygenOutput {
  key_package: number[];
  public_key_package: number[];
  identifier: number[];
}

export interface NapiCentralizedKeygenOutput {
  private_key: number[];
  keygen_outputs: NapiKeygenOutput[];
  public_key: number[];
}

export interface NapiSigningCommitmentOutput {
  nonces: number[];
  commitments: number[];
  identifier: number[];
}

export interface NapiSignatureShareOutput {
  signature_share: number[];
  identifier: number[];
}

export interface NapiSignatureOutput {
  signature: number[];
}

export interface NapiKeyPackageShares {
  signing_share: number[];
  verifying_share: number[];
}

export function runKeygenCentralizedEd25519(): NapiCentralizedKeygenOutput {
  return napiKeygenCentralizedEd25519();
}

export function runKeygenImportEd25519(
  secretKey: Uint8Array,
): NapiCentralizedKeygenOutput {
  return napiKeygenImportEd25519(Array.from(secretKey));
}

export function runSignRound1Ed25519(
  keyPackage: Uint8Array,
): NapiSigningCommitmentOutput {
  return napiSignRound1Ed25519(Array.from(keyPackage));
}

export function runSignRound2Ed25519(
  message: Uint8Array,
  keyPackage: Uint8Array,
  nonces: Uint8Array,
  allCommitments: CommitmentEntry[],
): NapiSignatureShareOutput {
  return napiSignRound2Ed25519(
    Array.from(message),
    Array.from(keyPackage),
    Array.from(nonces),
    allCommitments,
  );
}

export function runAggregateEd25519(
  message: Uint8Array,
  allCommitments: CommitmentEntry[],
  allSignatureShares: SignatureShareEntry[],
  publicKeyPackage: Uint8Array,
): NapiSignatureOutput {
  return napiAggregateEd25519(
    Array.from(message),
    allCommitments,
    allSignatureShares,
    Array.from(publicKeyPackage),
  );
}

export function runVerifyEd25519(
  message: Uint8Array,
  signature: Uint8Array,
  publicKeyPackage: Uint8Array,
): boolean {
  return napiVerifyEd25519(
    Array.from(message),
    Array.from(signature),
    Array.from(publicKeyPackage),
  );
}

export function extractKeyPackageSharesEd25519(
  keyPackage: Uint8Array,
): NapiKeyPackageShares {
  return napiExtractKeyPackageSharesEd25519(Array.from(keyPackage));
}

export function reconstructKeyPackageEd25519(
  signingShare: Uint8Array,
  verifyingShare: Uint8Array,
  identifier: Uint8Array,
  verifyingKey: Uint8Array,
  minSigners: number,
): Uint8Array {
  return new Uint8Array(
    napiReconstructKeyPackageEd25519(
      Array.from(signingShare),
      Array.from(verifyingShare),
      Array.from(identifier),
      Array.from(verifyingKey),
      minSigners,
    ),
  );
}

export function reconstructPublicKeyPackageEd25519(
  clientVerifyingShare: Uint8Array,
  clientIdentifier: Uint8Array,
  serverVerifyingShare: Uint8Array,
  serverIdentifier: Uint8Array,
  verifyingKey: Uint8Array,
): Uint8Array {
  return new Uint8Array(
    napiReconstructPublicKeyPackageEd25519(
      Array.from(clientVerifyingShare),
      Array.from(clientIdentifier),
      Array.from(serverVerifyingShare),
      Array.from(serverIdentifier),
      Array.from(verifyingKey),
    ),
  );
}
