// Executing this before any other statement
loadEnv(ENV_FILE_NAME);

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { loadEnv, verifyEnv } from "@oko-wallet/dotenv";

import { ENV_FILE_NAME, envSchema } from "@oko-wallet-ct-dashboard/envs";

async function main() {
  const envRes = verifyEnv(envSchema, process.env);
  if (!envRes.success) {
    console.error("Env variable invalid\n%s", envRes.err);
    process.exit(1);
  }

  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();
  const port = process.env.SERVER_PORT;

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(port);

    console.log(`Server listening at http://localhost:${port}`);
  });
}

main().then();
