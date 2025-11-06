import type { Bytes33 } from "@oko-wallet/bytes";
import type { OkoApiResponse } from "@oko-wallet/ewallet-types/api_response";
import type { CheckKeyShareResponse } from "@oko-wallet/ksn-interface/key_share";

export async function requestCheckKeyShare(
  ksNodeURI: string,
  userEmail: string,
  publicKey: Bytes33,
) {
  const res = await fetch(`${ksNodeURI}/keyshare/v1/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
      public_key: publicKey.toHex(),
    }),
  });
  return (await res.json()) as OkoApiResponse<CheckKeyShareResponse>;
}
