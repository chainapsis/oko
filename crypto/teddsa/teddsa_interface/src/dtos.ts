// NOTE: Bytes types use @oko-wallet/bytes for type-safe fixed-length byte handling
// NOTE: Use *FromRaw() to convert WASM output to Bytes types, *ToRaw() for the reverse

import { Bytes, type Bytes32, type Bytes64 } from "@oko-wallet/bytes";
import type {
  KeyPackageRaw,
  PublicKeyPackageRaw,
  CentralizedKeygenOutput,
} from "./keygen";
import type {
  SigningCommitmentOutput,
  SignatureShareOutput,
  CommitmentEntry,
  SignatureShareEntry,
  SignatureOutput,
} from "./sign";

export interface KeyPackage {
  identifier: Bytes32;
  signing_share: Bytes32;
  verifying_share: Bytes32;
  verifying_key: Bytes32;
  min_signers: number;
}

export interface PublicKeyPackage {
  verifying_shares: Map<string, Bytes32>;
  verifying_key: Bytes32;
}

export interface CentralizedKeygen {
  keygen_outputs: KeyPackage[];
  public_key_package: PublicKeyPackage;
}

export interface SigningCommitment {
  nonces: Uint8Array;
  commitments: Uint8Array;
  identifier: Bytes32;
}

export interface SignatureShare {
  signature_share: Bytes32;
  identifier: Bytes32;
}

export interface Commitment {
  identifier: Bytes32;
  commitments: Uint8Array;
}

export interface SignShare {
  identifier: Bytes32;
  signature_share: Bytes32;
}

export interface Signature {
  signature: Bytes64;
}

export function keyPackageFromRaw(raw: KeyPackageRaw): KeyPackage {
  return {
    identifier: Bytes.fromUint8ArrayUnsafe(new Uint8Array(raw.identifier), 32),
    signing_share: Bytes.fromUint8ArrayUnsafe(
      new Uint8Array(raw.signing_share),
      32,
    ),
    verifying_share: Bytes.fromUint8ArrayUnsafe(
      new Uint8Array(raw.verifying_share),
      32,
    ),
    verifying_key: Bytes.fromUint8ArrayUnsafe(
      new Uint8Array(raw.verifying_key),
      32,
    ),
    min_signers: raw.min_signers,
  };
}

export function publicKeyPackageFromRaw(
  raw: PublicKeyPackageRaw,
): PublicKeyPackage {
  const verifying_shares = new Map<string, Bytes32>();
  for (const [idHex, share] of Object.entries(raw.verifying_shares)) {
    verifying_shares.set(
      idHex,
      Bytes.fromUint8ArrayUnsafe(new Uint8Array(share), 32),
    );
  }
  return {
    verifying_shares,
    verifying_key: Bytes.fromUint8ArrayUnsafe(
      new Uint8Array(raw.verifying_key),
      32,
    ),
  };
}

export function centralizedKeygenFromRaw(
  raw: CentralizedKeygenOutput,
): CentralizedKeygen {
  return {
    keygen_outputs: raw.keygen_outputs.map(keyPackageFromRaw),
    public_key_package: publicKeyPackageFromRaw(raw.public_key_package),
  };
}

export function signingCommitmentFromRaw(
  raw: SigningCommitmentOutput,
): SigningCommitment {
  return {
    nonces: new Uint8Array(raw.nonces),
    commitments: new Uint8Array(raw.commitments),
    identifier: Bytes.fromUint8ArrayUnsafe(new Uint8Array(raw.identifier), 32),
  };
}

export function signatureShareFromRaw(
  raw: SignatureShareOutput,
): SignatureShare {
  return {
    signature_share: Bytes.fromUint8ArrayUnsafe(
      new Uint8Array(raw.signature_share),
      32,
    ),
    identifier: Bytes.fromUint8ArrayUnsafe(new Uint8Array(raw.identifier), 32),
  };
}

export function signatureFromRaw(raw: SignatureOutput): Signature {
  return {
    signature: Bytes.fromUint8ArrayUnsafe(new Uint8Array(raw.signature), 64),
  };
}

export function keyPackageToRaw(pkg: KeyPackage): KeyPackageRaw {
  return {
    identifier: Array.from(pkg.identifier.toUint8Array()),
    signing_share: Array.from(pkg.signing_share.toUint8Array()),
    verifying_share: Array.from(pkg.verifying_share.toUint8Array()),
    verifying_key: Array.from(pkg.verifying_key.toUint8Array()),
    min_signers: pkg.min_signers,
  };
}

export function publicKeyPackageToRaw(
  pkg: PublicKeyPackage,
): PublicKeyPackageRaw {
  const verifying_shares: Record<string, number[]> = {};
  for (const [idHex, share] of pkg.verifying_shares) {
    verifying_shares[idHex] = Array.from(share.toUint8Array());
  }
  return {
    verifying_shares,
    verifying_key: Array.from(pkg.verifying_key.toUint8Array()),
  };
}

export function commitmentToEntry(c: Commitment): CommitmentEntry {
  return {
    identifier: Array.from(c.identifier.toUint8Array()),
    commitments: Array.from(c.commitments),
  };
}

export function signShareToEntry(s: SignShare): SignatureShareEntry {
  return {
    identifier: Array.from(s.identifier.toUint8Array()),
    signature_share: Array.from(s.signature_share.toUint8Array()),
  };
}

export function serializeKeyPackage(pkg: KeyPackage): number[] {
  const result: number[] = [];
  result.push(...pkg.identifier.toUint8Array());
  result.push(...pkg.signing_share.toUint8Array());
  result.push(...pkg.verifying_share.toUint8Array());
  result.push(...pkg.verifying_key.toUint8Array());
  result.push(pkg.min_signers & 0xff);
  result.push((pkg.min_signers >> 8) & 0xff);
  return result;
}

export function serializePublicKeyPackage(pkg: PublicKeyPackage): number[] {
  const raw = publicKeyPackageToRaw(pkg);
  const json = JSON.stringify(raw);
  return Array.from(new TextEncoder().encode(json));
}
