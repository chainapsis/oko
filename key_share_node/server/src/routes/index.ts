import type { Express } from "express";

import { makeKeyshareRouter, makeKeyshareV2Router } from "./key_share";
import { makePgDumpRouter } from "./pg_dump";
import { addStatusRoutes } from "./status";

export function setRoutes(app: Express) {
  const keyshareRouter = makeKeyshareRouter();
  app.use("/keyshare/v1", keyshareRouter);

  const keyshareV2Router = makeKeyshareV2Router();
  app.use("/keyshare/v2", keyshareV2Router);

  const pgDumpRouter = makePgDumpRouter();
  app.use("/pg_dump/v1", pgDumpRouter);

  addStatusRoutes(app);
}
