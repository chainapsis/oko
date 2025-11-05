import { z } from "zod";

export const ENV_FILE_NAME = "import_demo_web.env";
export const EXAMPLE_ENV_FILE = "import_demo_web.env.example";

export const envSchema = z.object({
  SERVER_PORT: z.string(),
  NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT: z.string(),
});
