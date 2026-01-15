"use client";

import { flexRender } from "@tanstack/react-table";

import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import {
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@oko-wallet/oko-common-ui/table";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { useAPIKeys } from "@oko-wallet-ct-dashboard/hooks/use_api_keys";

import { APIKeyItemRow } from "./api_key_item_row";
import { useAPIKeysTable } from "./use_api_keys_table";

import styles from "./api_key_list.module.scss";

export const APIKeyList = () => {
  const { data: apiKeys } = useAPIKeys();
  const { table } = useAPIKeysTable(apiKeys ?? []);

  return (
    <div className={styles.wrapper}>
      <div>
        <Typography
          tagType="h1"
          size="display-sm"
          weight="semibold"
          color="primary"
        >
          API Keys
        </Typography>

        <Spacing height={8} />

        <Typography size="md" weight="medium" color="tertiary">
          View and manage your API keys
        </Typography>
      </div>

      <Table variant="bordered">
        <TableHead>
          <TableRow>
            {table.getFlatHeaders().map((header) => (
              <TableHeaderCell key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <APIKeyItemRow
              key={row.id}
              apiKey={row.getValue("hashed_key")}
              status={row.original.is_active ? "active" : "inactive"}
              createdDate={row.getValue("created_at") || ""}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
