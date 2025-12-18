import type { Bytes32, Bytes33 } from "@oko-wallet/bytes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { CheckKeyShareResponse } from "@oko-wallet/ksn-interface/key_share";
import type { AuthType } from "@oko-wallet/oko-types/auth";

export async function requestCheckKeyShare(
  ksNodeURI: string,
  userEmail: string,
  publicKey: Bytes33,
  auth_type: AuthType,
) {
  const res = await fetch(`${ksNodeURI}/keyshare/v1/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
      auth_type,
      public_key: publicKey.toHex(),
    }),
  });
  return (await res.json()) as OkoApiResponse<CheckKeyShareResponse>;
}

export async function requestCheckKeyShareEd25519(
  ksNodeURI: string,
  userEmail: string,
  publicKey: Bytes32,
) {
  const res = await fetch(`${ksNodeURI}/keyshare/v1/check_ed25519`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
      public_key: publicKey.toHex(),
      curve_type: "ed25519",
    }),
  });
  return (await res.json()) as OkoApiResponse<CheckKeyShareResponse>;
}
