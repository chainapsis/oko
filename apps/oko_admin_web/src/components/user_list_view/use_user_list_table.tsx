import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import type { WalletWithEmailAndKSNodesResponse } from "@oko-wallet/oko-types/admin";
import type { KSNodeWithHealthCheck } from "@oko-wallet/oko-types/tss";

import {
  useTable,
  useTablePagination,
} from "@oko-wallet-admin/components/table/use_table";
import { useGetWallets } from "./use_get_wallets";
import styles from "./user_list_table.module.scss";
import cn from "classnames";
import { useAllKeyShareNodes } from "@oko-wallet-admin/fetch/ks_node/use_all_ks_nodes";

const columnHelper = createColumnHelper<WalletWithEmailAndKSNodesResponse>();

function createColumns(
  allKeyShareNodesData:
    | {
        ksNodes: KSNodeWithHealthCheck[];
      }
    | undefined,
) {
  return [
    columnHelper.accessor((row) => row.auth_type, {
      id: "auth_type",
      header: "Auth Type",
    }),
    columnHelper.accessor((row) => row.email, {
      id: "email",
      header: "User Identifier",
    }),
    columnHelper.accessor((row) => row.public_key, {
      id: "public_key",
      header: "Public Key",
    }),
    columnHelper.accessor((row) => row.wallet_id, {
      id: "ks_nodes",
      header: "KS Nodes",
      cell: ({ row }) => {
        const walletKSNodes = row.original.wallet_ks_nodes;
        const connectedNodes = (allKeyShareNodesData?.ksNodes ?? []).filter(
          (node) => walletKSNodes.includes(node.node_id),
        );

        if (connectedNodes.length === 0) {
          return (
            <div className={styles.ksNodesContainer}>No nodes assigned</div>
          );
        }

        const nodeElements = connectedNodes.map((node) => {
          const isActive = node.status === "ACTIVE";
          const nodeClassName = cn(styles.nodeName, {
            [styles.nodeActive]: isActive,
            [styles.nodeInactive]: !isActive,
          });

          return (
            <div key={node.node_id} className={nodeClassName}>
              {node.node_name}
            </div>
          );
        });

        return <div className={styles.ksNodesContainer}>{nodeElements}</div>;
      },
    }),
  ];
}

export function useUserListTable() {
  const {
    pageIndex,
    currentPage,
    handlePageChange,
    pagination,
    onPaginationChange,
  } = useTablePagination({
    initialPageSize: 10,
  });

  const { data } = useGetWallets(pageIndex);

  const wallets = data?.wallets ?? [];
  const totalPageCount = data?.pagination?.total_pages ?? 0;

  const { data: allKeyShareNodesData } = useAllKeyShareNodes();
  const columns = createColumns(allKeyShareNodesData);

  const table = useTable({
    columns,
    data: wallets,
    pagination,
    onPaginationChange,
    pageCount: totalPageCount,
    manualPagination: true,
  });

  return { table, currentPage, totalPageCount, handlePageChange };
}
