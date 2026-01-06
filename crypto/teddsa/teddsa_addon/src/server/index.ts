import type {
  TeddsaCentralizedKeygenOutput,
  TeddsaSignRound1Output,
  TeddsaSignRound2Output,
  TeddsaAggregateOutput,
  TeddsaCommitmentEntry,
  TeddsaSignatureShareEntry,
} from "@oko-wallet/teddsa-interface";

import {
  napiKeygenCentralizedEd25519,
  napiKeygenImportEd25519,
  napiSignRound1Ed25519,
  napiSignRound2Ed25519,
  napiAggregateEd25519,
  napiVerifyEd25519,
} from "../../addon/index.js";

export function runKeygenCentralizedEd25519(): TeddsaCentralizedKeygenOutput {
  return napiKeygenCentralizedEd25519();
}

export function runKeygenImportEd25519(
  secretKey: Uint8Array,
): TeddsaCentralizedKeygenOutput {
  return napiKeygenImportEd25519(Array.from(secretKey));
}

export function runSignRound1Ed25519(
  keyPackage: Uint8Array,
): TeddsaSignRound1Output {
  return napiSignRound1Ed25519(Array.from(keyPackage));
}

export function runSignRound2Ed25519(
  message: Uint8Array,
  keyPackage: Uint8Array,
  nonces: Uint8Array,
  allCommitments: TeddsaCommitmentEntry[],
): TeddsaSignRound2Output {
  return napiSignRound2Ed25519(
    Array.from(message),
    Array.from(keyPackage),
    Array.from(nonces),
    allCommitments,
  );
}

export function runAggregateEd25519(
  message: Uint8Array,
  allCommitments: TeddsaCommitmentEntry[],
  allSignatureShares: TeddsaSignatureShareEntry[],
  publicKeyPackage: Uint8Array,
): TeddsaAggregateOutput {
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
