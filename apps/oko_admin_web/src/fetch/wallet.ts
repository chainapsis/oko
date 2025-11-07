import type {
  GetWalletListRequest,
  GetWalletListResponse,
} from "@oko-wallet/oko-types/admin";

import { errorHandle } from "./utils";
import { OKO_ADMIN_API_ENDPOINT_V1 } from ".";

export async function getWalletList({
  token,
  limit = 10,
  offset = 0,
}: {
  token: string;
  limit?: number;
  offset?: number;
}) {
  const body: GetWalletListRequest = {
    limit,
    offset,
  };

  return errorHandle<GetWalletListResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/wallet/get_wallet_list`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  );
}
