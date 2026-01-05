import { z } from "zod";

import { registry } from "../registry";

const LogLevelSchema = z.enum(["error", "warn", "info"]).openapi({
  description: "Log severity level",
  example: "info",
});

const LogErrorSchema = registry.register(
  "LogError",
  z.object({
    name: z.string().openapi({
      description: "Error name",
    }),
    message: z.string().openapi({
      description: "Error message",
    }),
    stack: z.string().optional().openapi({
      description: "Stack trace",
    }),
    fileName: z.string().optional().openapi({
      description: "Source file name",
    }),
    lineNumber: z.number().optional().openapi({
      description: "Source line number",
    }),
    columnNumber: z.number().optional().openapi({
      description: "Source column number",
    }),
  }),
);

const LogSessionSchema = registry.register(
  "LogSession",
  z.object({
    sessionId: z.string().optional().openapi({
      description: "Session identifier",
    }),
    pageUrl: z.string().optional().openapi({
      description: "Page URL",
    }),
    email: z.string().optional().openapi({
      description: "User email address",
    }),
    customerId: z.string().optional().openapi({
      description: "Customer identifier",
    }),
  }),
);

const LogClientInfoSchema = registry.register(
  "LogClientInfo",
  z.object({
    userAgent: z.string().openapi({
      description: "User agent string",
    }),
    platform: z.string().openapi({
      description: "Client platform",
    }),
    screen: z
      .object({
        width: z.number().openapi({
          description: "Screen width in pixels",
        }),
        height: z.number().openapi({
          description: "Screen height in pixels",
        }),
      })
      .openapi({
        description: "Screen size",
      }),
  }),
);

export const PostLogRequestSchema = registry.register(
  "PostLogRequest",
  z.object({
    level: LogLevelSchema,
    message: z.string().openapi({
      description: "Log message",
    }),
    timestamp: z.string().openapi({
      description: "Client timestamp (ISO string)",
      example: "2024-10-12T08:17:03.123Z",
    }),
    error: LogErrorSchema.optional(),
    session: LogSessionSchema.optional(),
    clientInfo: LogClientInfoSchema,
    meta: z.record(z.string(), z.any()).optional().openapi({
      description: "Additional metadata",
    }),
  }),
);

const PostLogResponseSchema = registry.register(
  "PostLogResponse",
  z.object({
    ingestedAt: z.string().openapi({
      description: "Server ingestion timestamp (ISO string)",
      example: "2024-10-12T08:17:03.123Z",
    }),
  }),
);

export const PostLogSuccessResponseSchema = registry.register(
  "PostLogSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: PostLogResponseSchema,
  }),
);
