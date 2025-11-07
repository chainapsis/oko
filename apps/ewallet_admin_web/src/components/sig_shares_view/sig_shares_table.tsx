import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createColumnHelper, flexRender } from "@tanstack/react-table";
import { type TssSessionWithCustomerAndUser } from "@oko-wallet/oko-types/tss";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@oko-wallet/oko-common-ui/table";

import styles from "./sig_shares_table.module.scss";
import { useGetTSSSessionsList } from "./use_get_tss_sessions";
import { EmptyState } from "@oko-wallet-admin/components/empty_state/empty_state";
import {
  useTable,
  useTablePagination,
} from "@oko-wallet-admin/components/table/use_table";
import { TableFilters } from "@oko-wallet-admin/components/table_filter/table_filter";
import { useAllKeyShareNodes } from "@oko-wallet-admin/fetch/ks_node/use_all_ks_nodes";

const defaultData: TssSessionWithCustomerAndUser[] = [];

const columnHelper = createColumnHelper<TssSessionWithCustomerAndUser>();

const columns = [
  columnHelper.accessor((row) => row.customer_label, {
    id: "customer_label",
    header: "App Name (Host App)",
    cell: (info) => {
      const customerUrl = info.row.original.customer_url;
      return customerUrl ? (
        <Link
          href={customerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.customerLink}
        >
          {info.getValue()}
        </Link>
      ) : (
        <div className={styles.customerLabel}>{info.getValue()}</div>
      );
    },
  }),
  columnHelper.accessor((row) => row.state, {
    id: "state",
    header: "State",
    cell: (info) => {
      const value = info.getValue();
      const isCompleted = value === "COMPLETED";
      return (
        <div
          className={`${styles.state} ${isCompleted ? styles.completed : ""}`}
        >
          {value}
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => row.session_id, {
    id: "session_id",
    header: "Session ID",
    cell: (info) => <div className={styles.sessionId}>{info.getValue()}</div>,
  }),
  columnHelper.accessor((row) => row.user_email, {
    id: "user_email",
    header: "Email",
    cell: (info) => <div className={styles.userEmail}>{info.getValue()}</div>,
  }),
  columnHelper.accessor((row) => row.wallet_id, {
    id: "wallet_id",
    header: "Wallet ID",
    cell: (info) => <div className={styles.walletId}>{info.getValue()}</div>,
  }),
  columnHelper.accessor((row) => row.wallet_public_key, {
    id: "wallet_public_key",
    header: "Public Key",
    cell: (info) => (
      <div className={styles.walletPublicKey}>{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor((row) => row.created_at, {
    id: "created_at",
    header: "Created At",
    cell: (info) => {
      const value = info.getValue();
      const date = new Date(value);

      return (
        <div className={styles.createdAt}>
          {date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => row.updated_at, {
    id: "updated_at",
    header: "Updated At",
    cell: (info) => {
      const value = info.getValue();
      const date = new Date(value);

      return (
        <div className={styles.updatedAt}>
          {date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
        </div>
      );
    },
  }),
];

export const SigSharesTable: React.FC = () => {
  const {
    pageIndex,
    currentPage,
    handlePageChange,
    pagination,
    onPaginationChange,
  } = useTablePagination({
    initialPageSize: 10,
  });

  const { data: nodeData } = useAllKeyShareNodes();

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedNodeId = searchParams.get("node_id");

  const toggleKSNode = (nodeId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedNodeId === nodeId) {
      params.delete("node_id");
    } else {
      params.set("node_id", nodeId);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { data } = useGetTSSSessionsList({
    page: pageIndex,
    nodeId: selectedNodeId || undefined,
  });

  const tssSessions = data?.tss_sessions ?? defaultData;
  const hasNext = data?.pagination?.has_next ?? false;
  const hasPrev = data?.pagination?.has_prev ?? false;

  const table = useTable({
    columns,
    data: tssSessions,
    pagination,
    onPaginationChange,
    manualPagination: true,
  });

  if (tssSessions.length === 0) {
    return <EmptyState text="No Sig History here yet." />;
  }

  return (
    <div className={styles.wrapper}>
      <TableFilters
        filters={[
          {
            name: "Keyshare Node",
            selectedOptionId: selectedNodeId ?? "",
            options: nodeData?.ksNodes
              .filter((n) => n.status === "ACTIVE")
              .map((n) => ({
                id: n.node_id,
                label: n.node_name,
              })),
            onClick: toggleKSNode,
          },
        ]}
      />
      <div className={styles.tableWrapper}>
        <Table variant="bordered" noWrap>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHeaderCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={styles.paginationWrapper}>
        <button
          className={styles.navButton}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrev || currentPage <= 1}
        >
          Prev
        </button>
        <span className={styles.pageInfo}>Page {currentPage}</span>
        <button
          className={styles.navButton}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};
