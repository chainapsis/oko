import { z } from "zod";

export const GetAuditLogsQuerySchema = z.object({
  target_type: z
    .string()
    .optional()
    .openapi({
      description: "Filter by target type",
      example: "customer",
      param: {
        name: "target_type",
        in: "query",
        required: false,
      },
    }),
  target_id: z
    .string()
    .optional()
    .openapi({
      description: "Filter by target ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
      param: {
        name: "target_id",
        in: "query",
        required: false,
      },
    }),
  action: z
    .string()
    .optional()
    .openapi({
      description: "Filter by action type",
      example: "create",
      param: {
        name: "action",
        in: "query",
        required: false,
      },
    }),
  actor: z
    .string()
    .optional()
    .openapi({
      description: "Filter by actor",
      example: "admin:123e4567-e89b-12d3-a456-426614174000",
      param: {
        name: "actor",
        in: "query",
        required: false,
      },
    }),
  source: z
    .string()
    .optional()
    .openapi({
      description: "Filter by source",
      example: "admin_ui",
      param: {
        name: "source",
        in: "query",
        required: false,
      },
    }),
  outcome: z
    .enum(["success", "failure", "denied"])
    .optional()
    .openapi({
      description: "Filter by outcome",
      example: "success",
      param: {
        name: "outcome",
        in: "query",
        required: false,
      },
    }),
  occurred_after: z.iso
    .datetime()
    .optional()
    .openapi({
      description: "Filter for events after this timestamp",
      example: "2023-01-01T00:00:00Z",
      param: {
        name: "occurred_after",
        in: "query",
        required: false,
      },
    }),
  occurred_before: z.iso
    .datetime()
    .optional()
    .openapi({
      description: "Filter for events before this timestamp",
      example: "2023-12-31T23:59:59Z",
      param: {
        name: "occurred_before",
        in: "query",
        required: false,
      },
    }),
  limit: z.coerce
    .number()
    .int()
    .optional()
    .openapi({
      description: "Number of results to return (default: 20)",
      example: 20,
      param: {
        name: "limit",
        in: "query",
        required: false,
      },
    }),
  offset: z.coerce
    .number()
    .int()
    .optional()
    .openapi({
      description: "Number of results to skip (for pagination)",
      example: 0,
      param: {
        name: "offset",
        in: "query",
        required: false,
      },
    }),
});

export const GetAuditLogsCountQuerySchema = z.object({
  target_type: z
    .string()
    .optional()
    .openapi({
      description: "Filter by target type",
      example: "customer",
      param: {
        name: "target_type",
        in: "query",
        required: false,
      },
    }),
  target_id: z
    .string()
    .optional()
    .openapi({
      description: "Filter by target ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
      param: {
        name: "target_id",
        in: "query",
        required: false,
      },
    }),
  action: z
    .string()
    .optional()
    .openapi({
      description: "Filter by action type",
      example: "create",
      param: {
        name: "action",
        in: "query",
        required: false,
      },
    }),
  actor: z
    .string()
    .optional()
    .openapi({
      description: "Filter by actor",
      example: "admin:123e4567-e89b-12d3-a456-426614174000",
      param: {
        name: "actor",
        in: "query",
        required: false,
      },
    }),
  source: z
    .string()
    .optional()
    .openapi({
      description: "Filter by source",
      example: "admin_ui",
      param: {
        name: "source",
        in: "query",
        required: false,
      },
    }),
  outcome: z
    .enum(["success", "failure", "denied"])
    .optional()
    .openapi({
      description: "Filter by outcome",
      example: "success",
      param: {
        name: "outcome",
        in: "query",
        required: false,
      },
    }),
  occurred_after: z
    .string()
    .datetime()
    .optional()
    .openapi({
      description: "Filter for events after this timestamp",
      example: "2023-01-01T00:00:00Z",
      param: {
        name: "occurred_after",
        in: "query",
        required: false,
      },
    }),
  occurred_before: z.iso
    .datetime()
    .optional()
    .openapi({
      description: "Filter for events before this timestamp",
      example: "2023-12-31T23:59:59Z",
      param: {
        name: "occurred_before",
        in: "query",
        required: false,
      },
    }),
});
