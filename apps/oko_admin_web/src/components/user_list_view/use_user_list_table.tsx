import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import type { UserWithWalletsResponse } from "@oko-wallet/oko-types/admin";
import type { KSNodeWithHealthCheck } from "@oko-wallet/oko-types/tss";

import {
  useTable,
  useTablePagination,
} from "@oko-wallet-admin/components/table/use_table";
import { useGetUsers } from "./use_get_users";
import styles from "./user_list_table.module.scss";
import cn from "classnames";
import { useAllKeyShareNodes } from "@oko-wallet-admin/fetch/ks_node/use_all_ks_nodes";

const columnHelper = createColumnHelper<UserWithWalletsResponse>();

function renderKSNodes(
  walletKSNodes: string[],
  allKeyShareNodesData: { ksNodes: KSNodeWithHealthCheck[] } | undefined,
) {
  const connectedNodes = (allKeyShareNodesData?.ksNodes ?? []).filter((node) =>
    walletKSNodes.includes(node.node_id),
  );

  if (connectedNodes.length === 0) {
    return <div className={styles.ksNodesContainer}>-</div>;
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
}

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
    columnHelper.accessor((row) => row.secp256k1_public_key, {
      id: "secp256k1_public_key",
      header: "Secp256k1 Public Key",
      cell: ({ getValue }) => getValue() ?? "-",
    }),
    columnHelper.accessor((row) => row.secp256k1_ks_nodes, {
      id: "secp256k1_ks_nodes",
      header: "Secp256k1 KS Nodes",
      cell: ({ getValue }) => renderKSNodes(getValue(), allKeyShareNodesData),
    }),
    columnHelper.accessor((row) => row.ed25519_public_key, {
      id: "ed25519_public_key",
      header: "Ed25519 Public Key",
      cell: ({ getValue }) => getValue() ?? "-",
    }),
    columnHelper.accessor((row) => row.ed25519_ks_nodes, {
      id: "ed25519_ks_nodes",
      header: "Ed25519 KS Nodes",
      cell: ({ getValue }) => renderKSNodes(getValue(), allKeyShareNodesData),
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

  const { data } = useGetUsers(pageIndex);

  const users = data?.users ?? [];
  const totalPageCount = data?.pagination?.total_pages ?? 0;

  const { data: allKeyShareNodesData } = useAllKeyShareNodes();
  const columns = createColumns(allKeyShareNodesData);

  const table = useTable({
    columns,
    data: users,
    pagination,
    onPaginationChange,
    pageCount: totalPageCount,
    manualPagination: true,
  });

  return { table, currentPage, totalPageCount, handlePageChange };
}
