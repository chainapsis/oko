import { z } from "zod";

export const ENV_FILE_NAME = "customer_dashboard.env";
export const EXAMPLE_ENV_FILE = "customer_dashboard.env.example";

export const envSchema = z.object({
  SERVER_PORT: z.string(),
  NEXT_PUBLIC_EWALLET_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_KEPLR_EWALLET_DEMO_ENDPOINT: z.string(),
  NEXT_PUBLIC_KEPLR_EWALLET_DOCS_ENDPOINT: z.string(),
});
