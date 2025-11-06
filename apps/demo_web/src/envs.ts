import { z } from "zod";

export const ENV_FILE_NAME = "demo_web.env";
export const EXAMPLE_ENV_FILE = "demo_web.env.example";

export const envSchema = z.object({
  SERVER_PORT: z.string(),
  NEXT_PUBLIC_OKO_SDK_ENDPOINT: z.string(),
  NEXT_PUBLIC_OKO_DOCS_ENDPOINT: z.string(),
});
