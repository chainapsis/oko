import { z } from "zod";

import { registry } from "../registry";

export const KSNodeWithHealthCheckSchema = registry.register(
  "KSNodeWithHealthCheck",
  z.object({
    node_id: z.string().openapi({
      description: "Unique node identifier",
    }),

    node_name: z.string().openapi({
      description: "Node name",
    }),

    status: z.enum(["ACTIVE", "INACTIVE"]).openapi({
      description: "Node status",
    }),

    server_url: z.string().openapi({
      description: "Node server URL",
    }),

    created_at: z.iso.datetime().openapi({
      description: "Creation timestamp",
    }),

    updated_at: z.iso.datetime().openapi({
      description: "Last update timestamp",
    }),

    health_check_status: z
      .enum(["HEALTHY", "UNHEALTHY"])
      .nullable()
      .optional()
      .openapi({
        description: "Latest health check status (optional)",
      }),

    health_checked_at: z.iso.datetime().nullable().optional().openapi({
      description: "Latest health check timestamp (optional)",
    }),
  }),
);
