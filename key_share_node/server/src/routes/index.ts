import type { Express } from "express";

import { makePgDumpRouter } from "./pg_dump";
import { addStatusRoutes } from "./status";
import { makeKeyshareRouter } from "./key_share/v1";
import { makeKeyshareV2Router } from "./key_share_v2";
import { makeCommitRevealRouter } from "./commit_reveal";

export function setRoutes(app: Express) {
  const keyshareRouter = makeKeyshareRouter();
  app.use("/keyshare/v1", keyshareRouter);

  const pgDumpRouter = makePgDumpRouter();
  app.use("/pg_dump/v1", pgDumpRouter);

  const keyshareV2Router = makeKeyshareV2Router();
  app.use("/keyshare/v2", keyshareV2Router);

  const commitRevealRouter = makeCommitRevealRouter();
  app.use("/commit-reveal/v2", commitRevealRouter);

  addStatusRoutes(app);
}
