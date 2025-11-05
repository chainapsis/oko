import { z } from "zod";

import { registry } from "../registry";

const presignTupleSchema = z.tuple([z.string(), z.string()]);

const PresignMessagesSchema = registry.register(
  "TssPresignMessages",
  z.object({
    wait_0: z
      .record(z.string(), z.string())
      .openapi({ description: "Participant -> presign wait_0 payload" }),
    wait_1: z
      .record(z.string(), presignTupleSchema)
      .openapi({ description: "Participant -> presign wait_1 tuple" }),
  }),
);

export const PresignStep1RequestSchema = registry.register(
  "TssPresignStep1Request",
  z.object({
    session_id: z.string().openapi({
      description: "TSS session identifier",
    }),
    msgs_1: PresignMessagesSchema.openapi({
      description: "Incoming presign messages",
    }),
  }),
);

const PresignStep1ResponseSchema = registry.register(
  "TssPresignStep1Response",
  z.object({
    msgs_0: PresignMessagesSchema.openapi({
      description: "Server generated presign messages",
    }),
  }),
);

// export const PresignStep1SuccessResponseSchema = makeSuccessResponseSchema(
//   PresignStep1ResponseSchema,
//   "TssPresignStep1SuccessResponse",
// );
export const PresignStep1SuccessResponseSchema = registry.register(
  "TssPresignStep1SuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: PresignStep1ResponseSchema,
  }),
);

export const PresignStep2RequestSchema = registry.register(
  "TssPresignStep2Request",
  z.object({
    session_id: z.string().openapi({
      description: "TSS session identifier",
    }),
    wait_1_0_1: presignTupleSchema.openapi({
      description: "Incoming presign wait tuple",
    }),
  }),
);

const PresignStep2ResponseSchema = registry.register(
  "TssPresignStep2Response",
  z.object({
    wait_1_1_0: presignTupleSchema.openapi({
      description: "Outgoing presign wait tuple",
    }),
  }),
);

// export const PresignStep2SuccessResponseSchema = makeSuccessResponseSchema(
//   PresignStep2ResponseSchema,
//   "TssPresignStep2SuccessResponse",
// );
export const PresignStep2SuccessResponseSchema = registry.register(
  "TssPresignStep2SuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: PresignStep2ResponseSchema,
  }),
);

export const PresignStep3RequestSchema = registry.register(
  "TssPresignStep3Request",
  z.object({
    session_id: z.string().openapi({
      description: "TSS session identifier",
    }),
    presign_big_r: z.string().openapi({
      description: "Presign big R value",
    }),
  }),
);

const PresignStep3ResponseSchema = registry.register(
  "TssPresignStep3Response",
  z.object({
    presign_big_r: z.string().openapi({
      description: "Presign big R response value",
    }),
  }),
);

// export const PresignStep3SuccessResponseSchema = makeSuccessResponseSchema(
//   PresignStep3ResponseSchema,
//   "TssPresignStep3SuccessResponse",
// );
export const PresignStep3SuccessResponseSchema = registry.register(
  "TssPresignStep3SuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: PresignStep3ResponseSchema,
  }),
);
