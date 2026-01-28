import { Router } from "express";

import { commitRevealCommit } from "./commit";

export function makeCommitRevealRouter() {
  const router = Router();

  router.post("/commit", commitRevealCommit);

  return router;
}
