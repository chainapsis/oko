import { Pool } from "pg";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { AuditEvent, AuditEventFilter } from "@oko-wallet/oko-types/admin";
import type {
  GetAuditLogsResponse,
  GetAuditLogsCountResponse,
} from "@oko-wallet/oko-types/admin";
import {
  getAuditEvents,
  getAuditEventsCount,
} from "@oko-wallet/oko-pg-interface/audit_events";

export async function getAuditLogs(
  db: Pool,
  filter: AuditEventFilter,
): Promise<OkoApiResponse<GetAuditLogsResponse>> {
  try {
    const getAuditEventsRes = await getAuditEvents(db, filter);
    if (getAuditEventsRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get audit events: ${getAuditEventsRes.err}`,
      };
    }

    return {
      success: true,
      data: {
        audit_logs: getAuditEventsRes.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get audit logs: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function getAuditLogsCount(
  db: Pool,
  filter: Omit<AuditEventFilter, "limit" | "offset">,
): Promise<OkoApiResponse<GetAuditLogsCountResponse>> {
  try {
    const getAuditEventsCountRes = await getAuditEventsCount(db, filter);
    if (getAuditEventsCountRes.success === false) {
      return {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: `Failed to get audit events count: ${getAuditEventsCountRes.err}`,
      };
    }

    return {
      success: true,
      data: {
        count: getAuditEventsCountRes.data,
      },
    };
  } catch (error) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: `Failed to get audit logs count: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
