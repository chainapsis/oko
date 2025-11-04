import { z } from "zod";

import { registry } from "../registry";

export const AbortTssSessionRequestSchema = registry.register(
  "TssAbortSessionRequest",
  z.object({
    session_id: z.string().openapi({
      description: "TSS session identifier",
    }),
  }),
);

const AbortTssSessionResponseSchema = registry.register(
  "TssAbortSessionResponse",
  z.object({
    session_id: z.string().openapi({
      description: "Aborted TSS session identifier",
    }),
  }),
);

// export const AbortTssSessionSuccessResponseSchema = makeSuccessResponseSchema(
//   AbortTssSessionResponseSchema,
//   "TssAbortSessionSuccessResponse",
// );
export const AbortTssSessionSuccessResponseSchema = registry.register(
  "TssAbortSessionSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: AbortTssSessionResponseSchema,
  }),
);
