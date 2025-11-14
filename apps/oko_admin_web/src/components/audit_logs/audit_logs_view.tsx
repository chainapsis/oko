"use client";

import { type FC, useState } from "react";
import { AuditLogsTable } from "./audit_logs_table";
import { AuditLogsFilter } from "./audit_logs_filter";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";
import { Pagination } from "@oko-wallet-admin/components/pagination/pagination";
import { EmptyState } from "@oko-wallet-admin/components/empty_state/empty_state";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { useGetAuditLogs } from "./use_get_audit_logs";
import type { AuditEventFilter } from "@oko-wallet/oko-types/admin";
import { useAppState } from "@oko-wallet-admin/state";

import styles from "./audit_logs_view.module.scss";

const DEFAULT_LIMIT = 20;

export const AuditLogsView: FC = () => {
  const { token } = useAppState();
  const [filter, setFilter] = useState<AuditEventFilter>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });

  const { auditLogs, isLoading, refetch, pagination, totalCount } =
    useGetAuditLogs(filter, token || undefined);

  const handleFilterChange = (newFilter: AuditEventFilter) => {
    setFilter({
      ...newFilter,
      limit: DEFAULT_LIMIT,
      offset: 0,
    });
  };

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({
      ...prev,
      offset: (page - 1) * DEFAULT_LIMIT,
    }));
  };

  if (isLoading && auditLogs.length === 0) {
    return (
      <div className={styles.wrapper}>
        <TitleHeader title="Audit Logs" />
        <div className={styles.loading}>
          <Typography size="md">Loading audit logs...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <TitleHeader title="Audit Logs" />

      <AuditLogsFilter filter={filter} onFilterChange={handleFilterChange} />

      <div className={styles.content}>
        {auditLogs.length === 0 ? (
          <div className={styles.emptyContainer}>
            <EmptyState text="No audit logs found" />
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <AuditLogsTable auditLogs={auditLogs} />
            </div>

            <div className={styles.paginationContainer}>
              <Pagination
                currentPage={
                  Math.floor((filter.offset || 0) / DEFAULT_LIMIT) + 1
                }
                totalPages={Math.ceil(totalCount / (filter.limit || 20))}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
