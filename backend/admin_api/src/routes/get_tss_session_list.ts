import type { Router, Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  GetTssSessionListRequest,
  GetTssSessionListResponse,
  GetTssAllActivationSettingResponse,
  SetTssAllActivationSettingRequest,
  SetTssAllActivationSettingResponse,
} from "@oko-wallet-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import { registry } from "@oko-wallet/oko-api-openapi";
import {
  AdminAuthHeaderSchema,
  ErrorResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  GetTssSessionListRequestSchema,
  GetTssSessionListSuccessResponseSchema,
  GetTssAllActivationSettingSuccessResponseSchema,
  SetTssAllActivationSettingRequestSchema,
  SetTssAllActivationSettingSuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/oko_admin";

import {
  adminAuthMiddleware,
  type AuthenticatedAdminRequest,
} from "@oko-wallet-admin-api/middleware";
import {
  getTssSessionList,
  getTssAllActivationSetting,
  setTssAllActivationSetting,
} from "@oko-wallet-admin-api/api/tss";

export async function get_tss_session_list(
  req: AuthenticatedAdminRequest<GetTssSessionListRequest>,
  res: Response<OkoApiResponse<GetTssSessionListResponse>>,
) {
  const state = req.app.locals as any;

  const result = await getTssSessionList(state.db, req.body);
  if (!result.success) {
    res.status(ErrorCodeMap[result.code] ?? 500).json(result);
    return;
  }

  res.status(200).json(result);
}
