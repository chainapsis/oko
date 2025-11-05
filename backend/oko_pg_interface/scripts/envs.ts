import { z } from "zod";

export const ENV_FILE_NAME = "ewallet_api_server.env";

export const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z.string(),
});
