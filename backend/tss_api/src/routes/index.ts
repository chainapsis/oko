import express from "express";

import { setKeygenV1Routes } from "./v1/keygen";
import { setTriplesRoutes } from "./v1/triples";
import { setPresignRoutes } from "./v1/presign";
import { setSignRoutes } from "./v1/sign";
import { setSignEd25519Routes } from "./sign_ed25519";
import { setWalletEd25519Routes } from "./wallet_ed25519";
import { setUserRoutes } from "./v1/user";
import { setTssSessionRoutes } from "./tss_session";
import { setKSNodeTelemetryRoutes } from "./ks_node_telemetry";

export function makeTssRouter() {
  const router = express.Router();

  setKeygenV1Routes(router);
  setTriplesRoutes(router);
  setPresignRoutes(router);
  setSignRoutes(router);
  setSignEd25519Routes(router);
  setWalletEd25519Routes(router);
  setUserRoutes(router);
  setTssSessionRoutes(router);
  setKSNodeTelemetryRoutes(router);

  return router;
}
