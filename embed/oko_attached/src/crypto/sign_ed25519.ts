
import type {
  KeyPackageRaw,
  PublicKeyPackageRaw,
} from "@oko-wallet/oko-types/teddsa";
import type { Result } from "@oko-wallet/stdlib-js";
import type { MakeSignOutputError } from "@oko-wallet/oko-sdk-core";


export interface KeyPackageEd25519 {
  keyPackage: KeyPackageRaw;
  publicKeyPackage: PublicKeyPackageRaw;
  identifier: Uint8Array;
}

export async function makeSignOutputEd25519(
  message: Uint8Array,
  keyPackage: KeyPackageEd25519,
  apiKey: string,
  authToken: string,
  getIsAborted: () => boolean,
): Promise<Result<Uint8Array, MakeSignOutputError>> {
  try {
    // @TODO

    // if (getIsAborted()) {
    //   return { success: false, err: { type: "aborted" } };
    // }

    // const presignRes = await reqPresignEd25519(
    //   TSS_V1_ENDPOINT,
    //   {},
    //   apiKey,
    //   authToken,
    // );

    // if (!presignRes.success) {
    //   return {
    //     success: false,
    //     err: {
    //       type: "sign_fail",
    //       error: { type: "error", msg: presignRes.msg },
    //     },
    //   };
    // }

    // const { session_id: sessionId, commitments_0: serverCommitment } =
    //   presignRes.data;

    // if (getIsAborted()) {
    //   return { success: false, err: { type: "aborted" } };
    // }

    // const round1Result = teddsaSignRound1(keyPackage.keyPackage);
    // if (!round1Result.success) {
    //   return {
    //     success: false,
    //     err: {
    //       type: "sign_fail",
    //       error: { type: "error", msg: round1Result.err },
    //     },
    //   };
    // }

    // const clientCommitment: CommitmentEntry = {
    //   identifier: round1Result.data.identifier,
    //   commitments: round1Result.data.commitments,
    // };

    // const allCommitments: CommitmentEntry[] = [
    //   clientCommitment,
    //   serverCommitment,
    // ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

    // if (getIsAborted()) {
    //   return { success: false, err: { type: "aborted" } };
    // }

    // const serverSignRes = await reqSignEd25519(
    //   TSS_V1_ENDPOINT,
    //   {
    //     session_id: sessionId,
    //     msg: [...message],
    //     commitments_1: clientCommitment,
    //   },
    //   authToken,
    // );

    // if (!serverSignRes.success) {
    //   return {
    //     success: false,
    //     err: {
    //       type: "sign_fail",
    //       error: { type: "error", msg: serverSignRes.msg },
    //     },
    //   };
    // }

    // const serverSignatureShare: SignatureShareEntry =
    //   serverSignRes.data.signature_share_0;

    // if (getIsAborted()) {
    //   return { success: false, err: { type: "aborted" } };
    // }

    // const round2Result = teddsaSignRound2(
    //   message,
    //   keyPackage.keyPackage,
    //   new Uint8Array(round1Result.data.nonces),
    //   allCommitments,
    // );

    // if (!round2Result.success) {
    //   return {
    //     success: false,
    //     err: {
    //       type: "sign_fail",
    //       error: { type: "error", msg: round2Result.err },
    //     },
    //   };
    // }

    // const clientSignatureShare: SignatureShareEntry = {
    //   identifier: round2Result.data.identifier,
    //   signature_share: round2Result.data.signature_share,
    // };

    // const allSignatureShares: SignatureShareEntry[] = [
    //   clientSignatureShare,
    //   serverSignatureShare,
    // ].sort((a, b) => (a.identifier[0] ?? 0) - (b.identifier[0] ?? 0));

    // const aggregateResult = teddsaAggregate(
    //   message,
    //   allCommitments,
    //   allSignatureShares,
    //   keyPackage.publicKeyPackage,
    // );

    // if (!aggregateResult.success) {
    //   return {
    //     success: false,
    //     err: {
    //       type: "sign_fail",
    //       error: { type: "error", msg: aggregateResult.err },
    //     },
    //   };
    // }

    return { success: true, data: new Uint8Array(64) };
  } catch (error) {
    return {
      success: false,
      err: {
        type: "sign_fail",
        error: {
          type: "error",
          msg: error instanceof Error ? error.message : String(error),
        },
      },
    };
  }
}
