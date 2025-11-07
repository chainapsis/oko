import { z } from "zod";

export const ENV_FILE_NAME = "oko_admin_web.env";
export const EXAMPLE_ENV_FILE = "oko_admin_web.env.example";

export const envSchema = z.object({
  SERVER_PORT: z.string(),
  NEXT_PUBLIC_OKO_API_ENDPOINT: z.string(),
});
