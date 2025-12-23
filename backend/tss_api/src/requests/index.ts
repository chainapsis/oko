import type { Bytes32, Bytes33 } from "@oko-wallet/bytes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { CheckKeyShareResponse } from "@oko-wallet/ksn-interface/key_share";
import type { AuthType } from "@oko-wallet/oko-types/auth";
import type { CurveType } from "@oko-wallet/ksn-interface/curve_type";

export async function requestCheckKeyShare(
  ksNodeURI: string,
  userEmail: string,
  publicKey: Bytes32 | Bytes33,
  auth_type: AuthType,
  curve_type: CurveType,
) {
  const res = await fetch(`${ksNodeURI}/keyshare/v1/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
      auth_type,
      curve_type,
      public_key: publicKey.toHex(),
    }),
  });
  return (await res.json()) as OkoApiResponse<CheckKeyShareResponse>;
}
