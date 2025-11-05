import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import type { ServerState } from "@oko-wallet/ewallet-api-server-state";

import { setRoutes } from "@oko-wallet-api/routes";
import { installSwaggerDocs } from "@oko-wallet-api/openapi";
import { loggingMiddleware } from "@oko-wallet-api/middleware/logging";

export function makeApp(state: ServerState) {
  const app = express();

  app.use(morgan("dev"));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  app.use(
    cors({
      exposedHeaders: ["X-New-Token"],
    }),
  );
  app.use(express.json({ limit: "10mb" }));

  app.locals = state;
  app.use(loggingMiddleware());
  app.get<{}, string>("/", (_, res) => {
    res.send("Ok");
  });

  setRoutes(app);

  // Should be called after registering all the components
  installSwaggerDocs(app);

  return app;
}
