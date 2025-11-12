import { Pool, type PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
import type { Result } from "@oko-wallet/stdlib-js";
import type {
  AuditEvent,
  CreateAuditEventRequest,
  AuditEventFilter,
} from "@oko-wallet/oko-types/admin";

export async function createAuditEvent(
  db: Pool | PoolClient,
  request: CreateAuditEventRequest,
): Promise<Result<AuditEvent, string>> {
  const query = `
INSERT INTO audit_event (
  id, occurred_at, request_id, actor, actor_ip, user_agent,
  source, action, target_type, target_id, changes, params, outcome, error
)
VALUES (
  $1, $2, $3, $4, $5, $6,
  $7, $8, $9, $10, $11, $12, $13, $14
)
RETURNING *
`;

  const values = [
    uuidv4(),
    new Date(),
    request.request_id,
    request.actor,
    request.actor_ip || null,
    request.user_agent || null,
    request.source,
    request.action,
    request.target_type,
    request.target_id || null,
    request.changes ? JSON.stringify(request.changes) : null,
    request.params ? JSON.stringify(request.params) : null,
    request.outcome,
    request.error || null,
  ];

  try {
    const result = await db.query<AuditEvent>(query, values);

    const row = result.rows[0];
    if (!row) {
      return {
        success: false,
        err: "Failed to create audit event",
      };
    }

    return {
      success: true,
      data: {
        ...row,
        changes: row.changes || undefined,
        params: row.params || undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getAuditEvents(
  db: Pool,
  filter: AuditEventFilter,
): Promise<Result<AuditEvent[], string>> {
  let query = `
SELECT *
FROM audit_event
WHERE 1=1
`;

  const values: any[] = [];
  let paramIndex = 1;

  if (filter.target_type) {
    query += ` AND target_type = $${paramIndex++}`;
    values.push(filter.target_type);
  }

  if (filter.target_id) {
    query += ` AND target_id = $${paramIndex++}`;
    values.push(filter.target_id);
  }

  if (filter.action) {
    query += ` AND action = $${paramIndex++}`;
    values.push(filter.action);
  }

  if (filter.actor) {
    query += ` AND actor = $${paramIndex++}`;
    values.push(filter.actor);
  }

  if (filter.source) {
    query += ` AND source = $${paramIndex++}`;
    values.push(filter.source);
  }

  if (filter.outcome) {
    query += ` AND outcome = $${paramIndex++}`;
    values.push(filter.outcome);
  }

  if (filter.occurred_after) {
    query += ` AND occurred_at >= $${paramIndex++}`;
    values.push(filter.occurred_after);
  }

  if (filter.occurred_before) {
    query += ` AND occurred_at <= $${paramIndex++}`;
    values.push(filter.occurred_before);
  }

  query += ` ORDER BY occurred_at DESC`;

  if (filter.limit) {
    query += ` LIMIT $${paramIndex++}`;
    values.push(filter.limit);
  }

  if (filter.offset) {
    query += ` OFFSET $${paramIndex++}`;
    values.push(filter.offset);
  }

  try {
    const result = await db.query<AuditEvent>(query, values);

    const events = result.rows.map((row) => ({
      ...row,
      changes: (row.changes as AuditEvent["changes"]) || undefined,
      params: (row.params as AuditEvent["params"]) || undefined,
    }));

    return {
      success: true,
      data: events,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getAuditEventsCount(
  db: Pool,
  filter: Omit<AuditEventFilter, "limit" | "offset">,
): Promise<Result<number, string>> {
  let query = `
SELECT COUNT(*)
FROM audit_event
WHERE 1=1
`;

  const values: any[] = [];
  let paramIndex = 1;

  if (filter.target_type) {
    query += ` AND target_type = $${paramIndex++}`;
    values.push(filter.target_type);
  }

  if (filter.target_id) {
    query += ` AND target_id = $${paramIndex++}`;
    values.push(filter.target_id);
  }

  if (filter.action) {
    query += ` AND action = $${paramIndex++}`;
    values.push(filter.action);
  }

  if (filter.actor) {
    query += ` AND actor = $${paramIndex++}`;
    values.push(filter.actor);
  }

  if (filter.source) {
    query += ` AND source = $${paramIndex++}`;
    values.push(filter.source);
  }

  if (filter.outcome) {
    query += ` AND outcome = $${paramIndex++}`;
    values.push(filter.outcome);
  }

  if (filter.occurred_after) {
    query += ` AND occurred_at >= $${paramIndex++}`;
    values.push(filter.occurred_after);
  }

  if (filter.occurred_before) {
    query += ` AND occurred_at <= $${paramIndex++}`;
    values.push(filter.occurred_before);
  }

  try {
    const result = await db.query(query, values);
    return { success: true, data: parseInt(result.rows[0].count) };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}
