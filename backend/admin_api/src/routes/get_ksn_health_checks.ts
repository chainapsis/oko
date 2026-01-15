import type { Response } from "express";

import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type {
  GetKSNHealthChecksRequest,
  GetKSNHealthChecksResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { getKSNHealthChecks } from "@oko-wallet-admin-api/api/ks_node";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";

export async function get_ksn_health_checks(
  req: AuthenticatedAdminRequest<GetKSNHealthChecksRequest>,
  res: Response<OkoApiResponse<GetKSNHealthChecksResponse>>,
) {
  const state = req.app.locals;

  const result = await getKSNHealthChecks(
    state.db,
    req.body.pageIndex,
    req.body.pageSize,
  );

  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
