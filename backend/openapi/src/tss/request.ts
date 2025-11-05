import { z } from "zod";

import { registry } from "../registry";

export const KeygenRequestSchema = registry.register(
  "TssKeygenRequest",
  z.object({
    keygen_2: z
      .object({
        private_share: z.string().openapi({
          description: "Private key share for TSS",
        }),
        public_key: z.string().openapi({
          description: "Public key in hex format",
        }),
      })
      .openapi({
        description: "Keygen stage 2 payload",
      }),
  }),
);
