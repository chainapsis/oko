"use client";

import { type FC } from "react";
import type { AuditEvent } from "@oko-wallet/oko-types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@oko-wallet/oko-common-ui/table";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Badge } from "@oko-wallet/oko-common-ui/badge";

import styles from "./audit_logs_table.module.scss";

interface AuditLogsTableProps {
  auditLogs: AuditEvent[];
}

export const AuditLogsTable: FC<AuditLogsTableProps> = ({ auditLogs }) => {
  const formatChanges = (changes: any[]) => {
    if (!changes || changes.length === 0) {
      return <Typography size="sm">-</Typography>;
    }

    return (
      <div className={styles.changes}>
        {changes.map((change, index) => (
          <div key={index} className={styles.change}>
            <Typography size="xs">{change.field}:</Typography>
            <Typography size="xs">
              {change.from !== undefined ? `${change.from} → ` : ""}
              {change.to}
            </Typography>
          </div>
        ))}
      </div>
    );
  };

  const formatParams = (params: Record<string, any>) => {
    if (!params || Object.keys(params).length === 0) {
      return <Typography size="sm">-</Typography>;
    }

    return (
      <div className={styles.params}>
        {Object.entries(params).map(([key, value], index) => (
          <div key={index} className={styles.param}>
            <Typography size="xs">{key}:</Typography>
            <Typography size="xs">{JSON.stringify(value)}</Typography>
          </div>
        ))}
      </div>
    );
  };

  const getOutcomeBadge = (outcome: string) => {
    const color =
      outcome === "success"
        ? "success"
        : outcome === "denied"
          ? "warning"
          : "error";
    return <Badge color={color} label={outcome} size="sm" />;
  };

  return (
    <div className={styles.container}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Time</TableHeaderCell>
            <TableHeaderCell>Request ID</TableHeaderCell>
            <TableHeaderCell>Actor</TableHeaderCell>
            <TableHeaderCell>Actor IP</TableHeaderCell>
            <TableHeaderCell>User Agent</TableHeaderCell>
            <TableHeaderCell>Source</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
            <TableHeaderCell>Target Type</TableHeaderCell>
            <TableHeaderCell>Target ID</TableHeaderCell>
            <TableHeaderCell>Outcome</TableHeaderCell>
            <TableHeaderCell>Changes</TableHeaderCell>
            <TableHeaderCell>Params</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {auditLogs.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Typography size="sm">
                  {new Date(row.occurred_at).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm" className={styles.targetId}>
                  {row.request_id || "-"}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm">{row.actor}</Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm">{row.actor_ip || "-"}</Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm" className={styles.userAgent}>
                  {row.user_agent || "-"}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm">{row.source}</Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm">{row.action}</Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm">{row.target_type}</Typography>
              </TableCell>
              <TableCell>
                <Typography size="sm" className={styles.targetId}>
                  {row.target_id || "-"}
                </Typography>
              </TableCell>
              <TableCell>{getOutcomeBadge(row.outcome)}</TableCell>
              <TableCell>{formatChanges(row.changes || [])}</TableCell>
              <TableCell>{formatParams(row.params || {})}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
