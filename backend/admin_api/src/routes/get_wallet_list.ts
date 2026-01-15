import type { Response } from "express";

import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { getWalletList } from "@oko-wallet-admin-api/api/wallet";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import type {
  GetWalletListRequest,
  GetWalletListResponse,
} from "@oko-wallet-types/admin";

export async function get_wallet_list(
  req: AuthenticatedAdminRequest<GetWalletListRequest>,
  res: Response<OkoApiResponse<GetWalletListResponse>>,
) {
  const state = req.app.locals;

  const result = await getWalletList(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
