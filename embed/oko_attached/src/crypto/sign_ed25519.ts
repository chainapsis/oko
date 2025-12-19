import {
  teddsaSignRound1,
  teddsaSignRound2,
  teddsaAggregate,
  type TeddsaSignError,
} from "@oko-wallet/teddsa-hooks-mock";
import type {
  CommitmentEntry,
  SignatureShareEntry,
  TeddsaKeygenOutputBytes,
} from "@oko-wallet/teddsa-hooks-mock/src/types";
import type { Result } from "@oko-wallet/stdlib-js";

import { TSS_V1_ENDPOINT } from "@oko-wallet-attached/requests/oko_api";

export interface SignEd25519Result {
  signature: Uint8Array;
}

export interface MakeSignOutputEd25519Error {
  type: "round1_fail" | "round2_fail" | "aggregate_fail" | "aborted";
  error?: string;
}

/**
 * Make an Ed25519 signature using 2-of-2 threshold signing.
 *
 * This function performs the full TEdDSA signing protocol:
 * 1. Client generates round 1 output (nonces + commitments)
 * 2. Server generates round 1 output
 * 3. Both exchange commitments
 * 4. Client generates round 2 output (signature share)
 * 5. Server generates round 2 output
 * 6. Client aggregates signature shares
 *
 * @param message - Message to sign (typically a transaction hash)
 * @param keygen1 - Client's keygen output (key_package, public_key_package)
 * @param apiKey - API key for server requests
 * @param authToken - JWT auth token
 * @param walletId - Wallet ID for the ed25519 wallet
 * @param getIsAborted - Function to check if signing should be aborted
 * @returns 64-byte Ed25519 signature
 */
export async function makeSignOutputEd25519(
  message: Uint8Array,
  keygen1: TeddsaKeygenOutputBytes,
  apiKey: string,
  authToken: string,
  walletId: string,
  getIsAborted: () => boolean,
): Promise<Result<SignEd25519Result, MakeSignOutputEd25519Error>> {
  // Round 1: Client generates nonces and commitments
  const clientRound1 = teddsaSignRound1(keygen1.key_package);
  if (!clientRound1.success) {
    return {
      success: false,
      err: { type: "round1_fail", error: clientRound1.err },
    };
  }

  if (getIsAborted()) {
    return { success: false, err: { type: "aborted" } };
  }

  // Round 1: Request server's commitment
  const serverRound1Res = await requestServerRound1(
    TSS_V1_ENDPOINT,
    walletId,
    [...message],
    {
      identifier: clientRound1.data.identifier,
      commitments: clientRound1.data.commitments,
    },
    authToken,
  );

  if (!serverRound1Res.success) {
    return {
      success: false,
      err: { type: "round1_fail", error: serverRound1Res.err },
    };
  }

  if (getIsAborted()) {
    return { success: false, err: { type: "aborted" } };
  }

  // Collect all commitments (client + server)
  const allCommitments: CommitmentEntry[] = [
    {
      identifier: clientRound1.data.identifier,
      commitments: clientRound1.data.commitments,
    },
    serverRound1Res.data.server_commitment,
  ];

  // Round 2: Client generates signature share
  const clientRound2 = teddsaSignRound2(
    message,
    keygen1.key_package,
    new Uint8Array(clientRound1.data.nonces),
    allCommitments,
  );

  if (!clientRound2.success) {
    return {
      success: false,
      err: { type: "round2_fail", error: clientRound2.err },
    };
  }

  if (getIsAborted()) {
    return { success: false, err: { type: "aborted" } };
  }

  // Round 2: Request server's signature share
  const serverRound2Res = await requestServerRound2(
    TSS_V1_ENDPOINT,
    walletId,
    [...message],
    {
      identifier: clientRound2.data.identifier,
      signature_share: clientRound2.data.signature_share,
    },
    allCommitments,
    serverRound1Res.data.server_nonces,
    authToken,
  );

  if (!serverRound2Res.success) {
    return {
      success: false,
      err: { type: "round2_fail", error: serverRound2Res.err },
    };
  }

  if (getIsAborted()) {
    return { success: false, err: { type: "aborted" } };
  }

  // Aggregate signature shares
  const allSignatureShares: SignatureShareEntry[] = [
    {
      identifier: clientRound2.data.identifier,
      signature_share: clientRound2.data.signature_share,
    },
    serverRound2Res.data.server_signature_share,
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
      err: { type: "aggregate_fail", error: aggregateResult.err },
    };
  }

  return {
    success: true,
    data: { signature: aggregateResult.data },
  };
}

// Server request types
interface ServerRound1Response {
  server_commitment: CommitmentEntry;
  server_nonces: number[];
}

interface ServerRound2Response {
  server_signature_share: SignatureShareEntry;
}

async function requestServerRound1(
  endpoint: string,
  walletId: string,
  message: number[],
  clientCommitment: CommitmentEntry,
  authToken: string,
): Promise<Result<ServerRound1Response, string>> {
  try {
    const response = await fetch(`${endpoint}/sign_ed25519/round1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        wallet_id: walletId,
        message,
        client_commitment: clientCommitment,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        err: `Server round1 request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        err: data.msg || "Server round1 failed",
      };
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}

async function requestServerRound2(
  endpoint: string,
  walletId: string,
  message: number[],
  clientSignatureShare: SignatureShareEntry,
  allCommitments: CommitmentEntry[],
  serverNonces: number[],
  authToken: string,
): Promise<Result<ServerRound2Response, string>> {
  try {
    const response = await fetch(`${endpoint}/sign_ed25519/round2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        wallet_id: walletId,
        message,
        client_signature_share: clientSignatureShare,
        all_commitments: allCommitments,
        server_nonces: serverNonces,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        err: `Server round2 request failed: ${response.status}`,
      };
    }

    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        err: data.msg || "Server round2 failed",
      };
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, err: String(error) };
  }
}
