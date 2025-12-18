import { Pool } from "pg";
import { decryptDataAsync } from "@oko-wallet/crypto-js/node";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";

import { validateWalletEmail } from "@oko-wallet-tss-api/api/utils";
import {
  runSignRound1Ed25519,
  runSignRound2Ed25519,
} from "@oko-wallet/teddsa-keplr-addon/src/server";

/**
 * Commitment entry for TEdDSA signing
 */
export interface TeddsaCommitmentEntry {
  identifier: number[];
  commitments: number[];
}

/**
 * Signature share entry for TEdDSA aggregation
 */
export interface TeddsaSignatureShareEntry {
  identifier: number[];
  signature_share: number[];
}

/**
 * Request for sign round 1
 */
export interface SignEd25519Round1Request {
  email: string;
  wallet_id: string;
  message: number[];
  client_commitment: TeddsaCommitmentEntry;
}

/**
 * Response from sign round 1
 */
export interface SignEd25519Round1Response {
  server_commitment: TeddsaCommitmentEntry;
  server_nonces: number[];
}

/**
 * Request for sign round 2
 */
export interface SignEd25519Round2Request {
  email: string;
  wallet_id: string;
  message: number[];
  client_signature_share: TeddsaSignatureShareEntry;
  all_commitments: TeddsaCommitmentEntry[];
  server_nonces: number[];
}

/**
 * Response from sign round 2
 */
export interface SignEd25519Round2Response {
  server_signature_share: TeddsaSignatureShareEntry;
}

/**
 * Body types for route handlers
 */
export interface SignEd25519Round1Body {
  message: number[];
  client_commitment: TeddsaCommitmentEntry;
}

export interface SignEd25519Round2Body {
  message: number[];
  client_signature_share: TeddsaSignatureShareEntry;
  all_commitments: TeddsaCommitmentEntry[];
  server_nonces: number[];
}

/**
 * TEdDSA Sign Round 1: Server generates its commitment
 *
 * This is a stateless operation - the server generates fresh nonces and commitments.
 * The nonces must be returned to the client and sent back in round 2.
 */
export async function runSignEd25519Round1(
  db: Pool,
  encryptionSecret: string,
  request: SignEd25519Round1Request,
): Promise<OkoApiResponse<SignEd25519Round1Response>> {
  try {
    const { email, wallet_id, message, client_commitment } = request;

    // Validate wallet belongs to user
    const validateRes = await validateWalletEmail(db, wallet_id, email);
    if (validateRes.success === false) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        msg: validateRes.err,
      };
    }
    const wallet = validateRes.data;

    // Check wallet is ed25519
    if (wallet.curve_type !== "ed25519") {
      return {
        success: false,
        code: "INVALID_WALLET_TYPE",
        msg: `Wallet is not ed25519: ${wallet.curve_type}`,
      };
    }

    // Decrypt the server's key_package
    const encryptedKeyPackage = wallet.enc_tss_share.toString("utf-8");
    const keyPackageHex = await decryptDataAsync(
      encryptedKeyPackage,
      encryptionSecret,
    );

    // Convert hex to bytes
    const keyPackageBytes = hexToBytes(keyPackageHex);

    // Generate server's round 1 output using native addon
    const serverRound1 = runSignRound1Ed25519(keyPackageBytes);

    return {
      success: true,
      data: {
        server_commitment: {
          identifier: serverRound1.identifier,
          commitments: serverRound1.commitments,
        },
        server_nonces: serverRound1.nonces,
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

/**
 * TEdDSA Sign Round 2: Server generates its signature share
 */
export async function runSignEd25519Round2(
  db: Pool,
  encryptionSecret: string,
  request: SignEd25519Round2Request,
): Promise<OkoApiResponse<SignEd25519Round2Response>> {
  try {
    const {
      email,
      wallet_id,
      message,
      client_signature_share,
      all_commitments,
      server_nonces,
    } = request;

    // Validate wallet belongs to user
    const validateRes = await validateWalletEmail(db, wallet_id, email);
    if (validateRes.success === false) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        msg: validateRes.err,
      };
    }
    const wallet = validateRes.data;

    // Check wallet is ed25519
    if (wallet.curve_type !== "ed25519") {
      return {
        success: false,
        code: "INVALID_WALLET_TYPE",
        msg: `Wallet is not ed25519: ${wallet.curve_type}`,
      };
    }

    // Decrypt the server's key_package
    const encryptedKeyPackage = wallet.enc_tss_share.toString("utf-8");
    const keyPackageHex = await decryptDataAsync(
      encryptedKeyPackage,
      encryptionSecret,
    );

    // Convert hex to bytes
    const keyPackageBytes = hexToBytes(keyPackageHex);

    // Generate server's round 2 output using native addon
    const serverRound2 = runSignRound2Ed25519(
      new Uint8Array(message),
      keyPackageBytes,
      new Uint8Array(server_nonces),
      all_commitments,
    );

    return {
      success: true,
      data: {
        server_signature_share: {
          identifier: serverRound2.identifier,
          signature_share: serverRound2.signature_share,
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

// Helper functions

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
