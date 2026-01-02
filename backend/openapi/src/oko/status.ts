import { z } from "zod";

import { registry } from "../registry";

export const OkoApiStatusResponseSchema = registry.register(
  "OkoApiStatusResponse",
  z.object({
    gitHead: z.string().openapi({
      description: "Git commit hash",
    }),
    serverPublicKey: z.string().openapi({
      description: "Server public key",
    }),
  }),
);

export const OkoApiRootResponseSchema = registry.register(
  "OkoApiRootResponse",
  z.string().openapi({
    description: "Service health response",
    example: "Ok",
  }),
);
