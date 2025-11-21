import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  SetTssAllActivationSettingRequest,
  SetTssAllActivationSettingResponse,
} from "@oko-wallet-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { setTssAllActivationSetting } from "@oko-wallet-admin-api/api/tss";

export async function set_tss_all_activation_setting(
  req: AuthenticatedAdminRequest<SetTssAllActivationSettingRequest>,
  res: Response<OkoApiResponse<SetTssAllActivationSettingResponse>>,
) {
  const state = req.app.locals as any;

  const result = await setTssAllActivationSetting(
    state.db,
    req.body,
    req.auditContext,
  );
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
