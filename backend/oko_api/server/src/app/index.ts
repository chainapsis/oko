import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import type { ServerState } from "@oko-wallet/oko-api-server-state";

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

  // Exclude typeform webhook from JSON parsing (needs raw body for signature verification)
  app.use((req, res, next) => {
    if (req.path === "/oko_admin/v1/customer/create_customer_by_typeform") {
      return next();
    }
    express.json({ limit: "10mb" })(req, res, next);
  });

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
