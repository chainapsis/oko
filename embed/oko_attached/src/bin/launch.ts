loadEnv(ENV_FILE_NAME);

import { createServer } from "vite";

import { loadEnv, verifyEnv } from "@oko-wallet/dotenv";
import { ENV_FILE_NAME, envSchema } from "@oko-wallet-attached/envs";

async function main() {
  console.log("NODE_ENV: %s", process.env.NODE_ENV);

  const envRes = verifyEnv(envSchema, process.env);
  if (!envRes.success) {
    console.error("Env variable invalid\n%s", envRes.err);
    process.exit(1);
  }

  // const dev = process.env.NODE_ENV !== "production";
  // const port = process.env.SERVER_PORT;

  const server = await createServer();

  await server.listen();
  server.printUrls(); // Print server URLs to the console
}

main().then();
