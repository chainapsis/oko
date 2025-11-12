import { v4 as uuidv4 } from "uuid";
import type { CreateAuditEventRequest } from "@oko-wallet/oko-types/admin";
import { createAuditEvent } from "@oko-wallet/oko-pg-interface/audit_events";

export interface AuditContext {
  db: any;
  adminUserId?: string;
  request?: any;
  requestId?: string;
}

export async function createAuditLog(
  context: AuditContext,
  action: string,
  targetType: string,
  targetId?: string,
  changes?: { field: string; from?: any; to?: any }[],
  params?: Record<string, any>,
  outcome: "success" | "failure" | "denied" = "success",
  error?: string,
) {
  const auditData: CreateAuditEventRequest = {
    request_id: context.requestId || uuidv4(),
    actor: context.adminUserId ? `admin:${context.adminUserId}` : "system",
    actor_ip: context.request?.ip || undefined,
    user_agent: context.request?.get?.("User-Agent") || undefined,
    source: context.request ? "admin_ui" : "job",
    action,
    target_type: targetType,
    target_id: targetId,
    changes,
    params: params,
    outcome,
    error,
  };

  return await createAuditEvent(context.db, auditData);
}
