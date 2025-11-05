import { z } from "zod";

import { registry } from "../registry";

const SignMessagesSchema = registry.register(
  "TssSignMessages",
  z
    .record(z.string(), z.string())
    .openapi({ description: "Participant -> sign message" }),
);

const SignOutputSchema = registry.register(
  "TssSignOutput",
  z.object({
    sig: z
      .object({
        big_r: z.string().openapi({ description: "Signature R component" }),
        s: z.string().openapi({ description: "Signature S component" }),
      })
      .openapi({ description: "Signature tuple" }),
    is_high: z.boolean().openapi({
      description: "Indicates whether signature s was normalized",
    }),
  }),
);

export const SignStep1RequestSchema = registry.register(
  "TssSignStep1Request",
  z.object({
    session_id: z.string().openapi({
      description: "TSS session identifier",
    }),
    msg: z
      .array(z.number())
      .openapi({ description: "Message to sign represented as byte array" }),
    msgs_1: z
      .object({
        wait_0: SignMessagesSchema,
      })
      .openapi({ description: "Incoming sign messages" }),
  }),
);

const SignStep1ResponseSchema = registry.register(
  "TssSignStep1Response",
  z.object({
    msgs_0: z
      .object({
        wait_0: SignMessagesSchema,
      })
      .openapi({ description: "Server generated sign messages" }),
  }),
);

// export const SignStep1SuccessResponseSchema = makeSuccessResponseSchema(
//   SignStep1ResponseSchema,
//   "TssSignStep1SuccessResponse",
// );
export const SignStep1SuccessResponseSchema = registry.register(
  "TssSignStep1SuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SignStep1ResponseSchema,
  }),
);

export const SignStep2RequestSchema = registry.register(
  "TssSignStep2Request",
  z.object({
    session_id: z.string().openapi({
      description: "TSS session identifier",
    }),
    sign_output: SignOutputSchema,
  }),
);

const SignStep2ResponseSchema = registry.register(
  "TssSignStep2Response",
  z.object({
    sign_output: SignOutputSchema,
  }),
);

// export const SignStep2SuccessResponseSchema = makeSuccessResponseSchema(
//   SignStep2ResponseSchema,
//   "TssSignStep2SuccessResponse",
// );
export const SignStep2SuccessResponseSchema = registry.register(
  "TssSignStep2SuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: SignStep2ResponseSchema,
  }),
);
