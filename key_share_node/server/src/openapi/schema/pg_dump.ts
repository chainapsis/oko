import { z } from "zod";

import { registry } from "../doc";

const dumpIdSchema = z
  .string()
  .describe("The id of the pg dump")
  .openapi({ example: "dump_01HZY1A8F7319MKG8GQ6A1M8RJ" });

const dumpPathSchema = z
  .string()
  .describe("The path to the pg dump")
  .openapi({ example: "/backups/dump_01HZY1A8F73.sql" });

const dumpSizeSchema = z
  .number()
  .describe("The size of the pg dump")
  .openapi({ example: 2457 });

const dumpDurationSchema = z
  .number()
  .describe("The duration of the pg dump")
  .openapi({ example: 12.34 });

export const PgDumpRequestBodySchema = registry.register(
  "PgDumpRequestBody",
  z
    .object({
      password: z
        .string()
        .describe("The admin password")
        .openapi({ example: "super-secret-password" }),
    })
    .openapi("PgDumpRequestBody", {
      description: "Request payload for triggering a new pg dump.",
    }),
);

export const PgDumpResponseSchema = registry.register(
  "PgDumpResponse",
  z
    .object({
      dump_id: dumpIdSchema,
      dump_path: dumpPathSchema,
      dump_size: dumpSizeSchema,
      dump_duration: dumpDurationSchema,
    })
    .openapi("PgDumpResponse", {
      description: "Response payload with metadata about the pg dump.",
    }),
);

const pgDumpMetaSchema = z
  .object({
    dump_duration: dumpDurationSchema.optional(),
    dump_size: dumpSizeSchema.optional(),
    error: z
      .string()
      .describe("The error message if dump failed")
      .openapi({ example: "pg_dump exited with code 1" })
      .optional(),
  })
  .openapi({
    description: "The meta data of the pg dump",
  });

export const PgDumpSchema = registry.register(
  "PgDump",
  z
    .object({
      dump_id: dumpIdSchema,
      status: z
        .enum(["IN_PROGRESS", "COMPLETED", "FAILED", "DELETED"])
        .describe("The status of the pg dump"),
      dump_path: dumpPathSchema.nullable(),
      meta: pgDumpMetaSchema,
      created_at: z
        .string()
        .describe("The created at timestamp of the pg dump")
        .openapi({ example: "2024-10-12T08:17:03.123Z" }),
      updated_at: z
        .string()
        .describe("The updated at timestamp of the pg dump")
        .openapi({ example: "2024-10-12T08:20:44.987Z" }),
    })
    .openapi("PgDump", {
      description: "Persisted representation of a pg dump request.",
    }),
);

export const PgRestoreRequestBodySchema = registry.register(
  "PgRestoreRequestBody",
  z
    .object({
      password: z
        .string()
        .describe("The admin password")
        .openapi({ example: "super-secret-password" }),
      dump_path: dumpPathSchema,
    })
    .openapi("PgRestoreRequestBody", {
      description: "Request payload for restoring a database from a pg dump.",
    }),
);

const PgRestoreResultSchema = registry.register(
  "PgRestoreResult",
  z
    .object({
      dump_path: dumpPathSchema.describe(
        "The path to the pg dump that was restored",
      ),
    })
    .openapi("PgRestoreResult", {
      description: "Information about the restored dump file.",
    }),
);

export const PgDumpSuccessResponseSchema = registry.register(
  "PgDumpSuccessResponse",
  z
    .object({
      success: z.literal(true),
      data: PgDumpResponseSchema,
    })
    .openapi("PgDumpSuccessResponse", {
      description: "Success response containing pg dump metadata.",
    }),
);

export const PgDumpHistorySuccessResponseSchema = registry.register(
  "PgDumpHistorySuccessResponse",
  z
    .object({
      success: z.literal(true),
      data: z.array(PgDumpSchema),
    })
    .openapi("PgDumpHistorySuccessResponse", {
      description: "Success response containing the pg dump history.",
    }),
);

export const PgRestoreSuccessResponseSchema = registry.register(
  "PgRestoreSuccessResponse",
  z
    .object({
      success: z.literal(true),
      data: PgRestoreResultSchema,
    })
    .openapi("PgRestoreSuccessResponse", {
      description: "Success response confirming the pg dump restore.",
    }),
);

export const PgDumpHistoryQuerySchema = z
  .object({
    days: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .describe(
        "Number of days to look back for dump history (1-1000 days). If not specified, returns all dumps.",
      )
      .openapi({ example: 30 })
      .optional(),
  })
  .openapi({
    description:
      "Optional query to limit the number of days returned for dump history.",
  });
