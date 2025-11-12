import { Pool } from "pg";
import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { AuditEventFilter } from "@oko-wallet/oko-types/admin";
import type { GetAuditLogsCountResponse } from "@oko-wallet/oko-types/admin";
import { getAuditLogsCount } from "@oko-wallet-admin-api/api/audit";
import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware";

export async function get_audit_logs_count(
  req: AuthenticatedAdminRequest,
  res: Response<OkoApiResponse<GetAuditLogsCountResponse>>,
) {
  const state = req.app.locals;
  const db = state.db as Pool;
  try {
    const params: Omit<AuditEventFilter, "limit" | "offset"> = {};

    if (req.query.target_type) {
      params.target_type = req.query.target_type as string;
    }
    if (req.query.target_id) {
      params.target_id = req.query.target_id as string;
    }
    if (req.query.action) {
      params.action = req.query.action as string;
    }
    if (req.query.actor) {
      params.actor = req.query.actor as string;
    }
    if (req.query.source) {
      params.source = req.query.source as string;
    }
    if (req.query.outcome) {
      params.outcome = req.query.outcome as "success" | "failure" | "denied";
    }
    if (req.query.occurred_after) {
      params.occurred_after = new Date(req.query.occurred_after as string);
    }
    if (req.query.occurred_before) {
      params.occurred_before = new Date(req.query.occurred_before as string);
    }

    const result = await getAuditLogsCount(db, params);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    const errorResponse: OkoApiResponse<GetAuditLogsCountResponse> = {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get audit logs count: ${error instanceof Error ? error.message : String(error)}`,
    };

    res.status(500).json(errorResponse);
  }
}
