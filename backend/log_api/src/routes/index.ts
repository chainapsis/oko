import express from "express";

import { setLogRoutes } from "./log";
import { initClientLogger } from "@oko-wallet-log-api/logger";

interface LogRouterOptions {
  esUrl: string | null;
  esIndex: string | null;
  esUsername: string | null;
  esPassword: string | null;
}

export function makeLogRouter(options: LogRouterOptions) {
  const router = express.Router();

  const clientLogger = initClientLogger({
    level: "info",
    esUrl: options.esUrl,
    esIndex: options.esIndex,
    esUsername: options.esUsername,
    esPassword: options.esPassword,
    console: false,
  });

  setLogRoutes(router, clientLogger);

  return router;
}
