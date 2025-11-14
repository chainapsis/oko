"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { AuditEventFilter } from "@oko-wallet/oko-types/admin";
import { getAuditLogs, getAuditLogsCount } from "@oko-wallet-admin/fetch/audit";
import {
  useTable,
  useTablePagination,
} from "@oko-wallet-admin/components/table/use_table";

const DEFAULT_LIMIT = 20;

export const useGetAuditLogs = (
  filter: AuditEventFilter = {},
  token?: string,
) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["auditLogs", filter, token],
    queryFn: () => getAuditLogs(filter, token),
    staleTime: 1000 * 60, // 1 minute
  });

  const { data: countData, isLoading: isCountLoading } = useQuery({
    queryKey: ["auditLogsCount", filter, token],
    queryFn: () => getAuditLogsCount(filter, token),
    staleTime: 1000 * 60, // 1 minute
  });

  const auditLogs = useMemo(
    () => (data && data.success ? data.data.audit_logs : []),
    [data],
  );
  const totalCount = useMemo(
    () => (countData && countData.success ? countData.data.count : 0),
    [countData],
  );

  const table = useTable({
    data: auditLogs,
    columns: [],
  });

  const pagination = useTablePagination({
    initialPageSize: DEFAULT_LIMIT,
  });

  return {
    auditLogs,
    isLoading: isLoading || isCountLoading,
    refetch,
    table,
    pagination,
    totalCount,
  };
};
