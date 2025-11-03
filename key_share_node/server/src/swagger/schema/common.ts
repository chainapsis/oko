import { registry } from "../registry";
import { z } from "zod";

export const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z
    .object({
      success: z.literal(false),
      code: z
        .string()
        .describe("Error code")
        .openapi({ example: "UNKNOWN_ERROR" }),
      msg: z
        .string()
        .describe("Error message")
        .openapi({ example: "An unexpected error occurred" }),
    })
    .openapi("ErrorResponse", {
      description: "Standard error response wrapper.",
    }),
);
