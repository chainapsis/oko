import { Router } from "express";

import { setKeygenV1Routes } from "./keygen";
import { setTriplesV1Routes } from "./triples";
import { setPresignV1Routes } from "./presign";
import { setSignV1Routes } from "./sign";
import { setUserV1Routes } from "./user";
import { setTssSessionRoutes } from "./tss_session";
import { setKSNodeTelemetryRoutes } from "./ks_node_telemetry";

export function makeV1Router() {
  const router = Router();

  setKeygenV1Routes(router);
  setTriplesV1Routes(router);
  setPresignV1Routes(router);
  setSignV1Routes(router);
  setUserV1Routes(router);

  setTssSessionRoutes(router);
  setKSNodeTelemetryRoutes(router);

  return router;
}
