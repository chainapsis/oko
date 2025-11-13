export interface AuditEvent {
  id: string;
  occurred_at: Date;
  request_id: string;
  actor: string;
  actor_ip?: string;
  user_agent?: string;
  source: string;
  action: string;
  target_type: string;
  target_id?: string;
  changes?: AuditChange[];
  params?: Record<string, any>;
  outcome: "success" | "failure" | "denied";
  error?: string;
}

export interface AuditChange {
  field: string;
  from?: any;
  to?: any;
}

export interface CreateAuditEventRequest {
  request_id: string;
  actor: string;
  actor_ip?: string;
  user_agent?: string;
  source: string;
  action: string;
  target_type: string;
  target_id?: string;
  changes?: AuditChange[];
  params?: Record<string, any>;
  outcome: "success" | "failure" | "denied";
  error?: string;
}

export interface AuditEventFilter {
  target_type?: string;
  target_id?: string;
  action?: string;
  actor?: string;
  source?: string;
  outcome?: "success" | "failure" | "denied";
  occurred_after?: Date;
  occurred_before?: Date;
  limit?: number;
  offset?: number;
}

export interface GetAuditLogsResponse {
  audit_logs: AuditEvent[];
}

export interface GetAuditLogsCountResponse {
  count: number;
}
