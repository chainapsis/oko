import { z } from "zod";

export const ENV_FILE_NAME = "ewallet_admin_web.env";
export const EXAMPLE_ENV_FILE = "ewallet_admin_web.env.example";

export const envSchema = z.object({
  SERVER_PORT: z.string(),
  NEXT_PUBLIC_OKO_API_ENDPOINT: z.string(),
});
