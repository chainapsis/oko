import { z } from "zod";

import { registry } from "../registry";

export const GetAttachedThemeQuerySchema = z.object({
  host_origin: z.string().min(1).openapi({
    description: "Origin host of the requesting app",
    example: "https://app.example.com",
    param: {
      name: "host_origin",
      in: "query",
      required: true,
    },
  }),
});

const CustomerThemeSchema = registry.register(
  "CustomerTheme",
  z.string().openapi({
    description: "Customer theme: light, dark, or system",
    example: "light",
  }),
);

export const GetAttachedThemeSuccessResponseSchema = registry.register(
  "GetAttachedThemeSuccessResponse",
  z.object({
    success: z.literal(true).openapi({
      description: "Indicates the request succeeded",
    }),
    data: CustomerThemeSchema,
  }),
);
