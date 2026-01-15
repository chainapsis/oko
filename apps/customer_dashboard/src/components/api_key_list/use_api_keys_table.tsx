import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import type { APIKey } from "@oko-wallet/oko-types/ct_dashboard";

export const useAPIKeysTable = (data: APIKey[]) => {
  const columns = [
    {
      header: "API Key",
      accessorKey: "hashed_key",
    },
    {
      header: "Created Date",
      accessorKey: "created_at",
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return { table };
};
