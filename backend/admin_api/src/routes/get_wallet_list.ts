import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetWalletListRequest,
  GetWalletListResponse,
} from "@oko-wallet-types/admin";
import type { Response, Router } from "express";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetWalletListRequestSchema,
  GetWalletListSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import {
  adminAuthMiddleware,
  type AuthenticatedAdminRequest,
} from "@oko-wallet-admin-api/middleware";
import { getWalletList } from "@oko-wallet-admin-api/api/wallet";

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
