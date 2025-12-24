import { z } from "zod";

import { registry } from "../registry";

export const KSNodeTelemetryRequestSchema = registry.register(
  "TssKSNodeTelemetryRequest",
  z.object({
    telemetry_node_id: z.string().openapi({
      description: "Unique identifier for the key share node telemetry",
    }),
    key_share_count: z.number().openapi({
      description: "Current number of key shares stored in the node",
    }),
    payload: z.object({}).loose().openapi({
      description:
        "Additional telemetry data (e.g., db status, error messages)",
    }),
  }),
);

export const KSNodeTelemetryResponseSchema = registry.register(
  "TssKSNodeTelemetryResponse",
  z.object({
    success: z.boolean().openapi({
      description: "Indicates if the telemetry was successfully processed",
    }),
    data: z.null().optional(),
  }),
);
