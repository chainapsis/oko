import express from "express";

import { setKeygenRoutes } from "./keygen";
import { setTriplesRoutes } from "./triples";
import { setPresignRoutes } from "./presign";
import { setSignRoutes } from "./sign";
import { setUserRoutes } from "./user";
import { setTssSessionRoutes } from "./tss_session";

export function makeTssRouter() {
  const router = express.Router();

  setKeygenRoutes(router);
  setTriplesRoutes(router);
  setPresignRoutes(router);
  setSignRoutes(router);
  setUserRoutes(router);
  setTssSessionRoutes(router);

  return router;
}
