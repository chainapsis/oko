import type { Express } from "express";

import { makeKeyshareRouter } from "./key_share/v1";
import { makeKeyshareV2Router } from "./key_share_v2";
import { makePgDumpRouter } from "./pg_dump";
import { addStatusRoutes } from "./status";

export function setRoutes(app: Express) {
  const keyshareRouter = makeKeyshareRouter();
  app.use("/keyshare/v1", keyshareRouter);

  const pgDumpRouter = makePgDumpRouter();
  app.use("/pg_dump/v1", pgDumpRouter);

  // NOTE: A new architecture where each io handler is mapped to a single file.
  const keyshareV2Router = makeKeyshareV2Router();
  app.use("/keyshare/v2", keyshareV2Router);

  addStatusRoutes(app);
}
