import { z } from "zod";

export const ENV_FILE_NAME = "user_dashboard.env";
export const EXAMPLE_ENV_FILE = "user_dashboard.env.example";

export const envSchema = z.object({
  SERVER_PORT: z.string(),
  NEXT_PUBLIC_OKO_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_OKO_DEMO_ENDPOINT: z.string(),
  NEXT_PUBLIC_OKO_DOCS_ENDPOINT: z.string(),
  NEXT_PUBLIC_OKO_FEATURE_REQUEST_ENDPOINT: z.string(),
  NEXT_PUBLIC_OKO_GET_SUPPORT_ENDPOINT: z.string(),
  KEPLR_API_ENDPOINT: z.string(),
});
