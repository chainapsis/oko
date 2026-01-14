import { z } from "zod";

import { registry } from "../doc";

export const ServerStatusSchema = registry.register(
  "ServerStatus",
  z
    .object({
      is_db_connected: z.boolean().openapi({
        description: "Whether the database connection is healthy",
      }),
      is_db_backup_checked: z.boolean().openapi({
        description: "Whether the database backup check has completed",
      }),
      latest_backup_time: z.string().nullable().openapi({
        description: "Latest backup timestamp (ISO string)",
        example: "2024-10-12T08:17:03.123Z",
      }),
      ks_node_public_key: z.string().openapi({
        description: "Key share node public key",
      }),
      launch_time: z.string().openapi({
        description: "Server launch timestamp (ISO string)",
        example: "2024-10-12T08:17:03.123Z",
      }),
      git_hash: z.string().nullable().openapi({
        description: "Git commit hash",
      }),
      version: z.string().openapi({
        description: "Server version",
      }),
    })
    .openapi("ServerStatus", {
      description: "Key share node status response",
    }),
);

export const OkResponseSchema = registry.register(
  "OkResponse",
  z.string().openapi({
    description: "Service health response",
    example: "Ok",
  }),
);
