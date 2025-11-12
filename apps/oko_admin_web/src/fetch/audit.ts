import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  AuditEvent,
  AuditEventFilter,
  GetAuditLogsResponse,
  GetAuditLogsCountResponse,
} from "@oko-wallet/oko-types/admin";

import { OKO_ADMIN_API_ENDPOINT_V1 } from "@oko-wallet-admin/fetch";
import { errorHandle } from "@oko-wallet-admin/fetch/utils";

export const getAuditLogs = async (
  filter: AuditEventFilter,
  token?: string,
): Promise<OkoApiResponse<GetAuditLogsResponse>> => {
  const params = new URLSearchParams();

  if (filter.target_type) params.append("target_type", filter.target_type);
  if (filter.target_id) params.append("target_id", filter.target_id);
  if (filter.action) params.append("action", filter.action);
  if (filter.actor) params.append("actor", filter.actor);
  if (filter.source) params.append("source", filter.source);
  if (filter.outcome) params.append("outcome", filter.outcome);
  if (filter.occurred_after)
    params.append("occurred_after", filter.occurred_after.toISOString());
  if (filter.occurred_before)
    params.append("occurred_before", filter.occurred_before.toISOString());
  if (filter.limit) params.append("limit", filter.limit.toString());
  if (filter.offset) params.append("offset", filter.offset.toString());

  return errorHandle<GetAuditLogsResponse>(() =>
    fetch(`${OKO_ADMIN_API_ENDPOINT_V1}/audit/logs?${params.toString()}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};

export const getAuditLogsCount = async (
  filter: Omit<AuditEventFilter, "limit" | "offset">,
  token?: string,
): Promise<OkoApiResponse<GetAuditLogsCountResponse>> => {
  const params = new URLSearchParams();

  if (filter.target_type) params.append("target_type", filter.target_type);
  if (filter.target_id) params.append("target_id", filter.target_id);
  if (filter.action) params.append("action", filter.action);
  if (filter.actor) params.append("actor", filter.actor);
  if (filter.source) params.append("source", filter.source);
  if (filter.outcome) params.append("outcome", filter.outcome);
  if (filter.occurred_after)
    params.append("occurred_after", filter.occurred_after.toISOString());
  if (filter.occurred_before)
    params.append("occurred_before", filter.occurred_before.toISOString());

  return errorHandle<GetAuditLogsCountResponse>(() =>
    fetch(
      `${OKO_ADMIN_API_ENDPOINT_V1}/audit/logs/count?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    ),
  );
};
