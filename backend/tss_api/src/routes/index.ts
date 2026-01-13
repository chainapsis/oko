import express from "express";

import { setKeygenRoutes } from "./keygen";
import { setTriplesRoutes } from "./triples";
import { setPresignRoutes } from "./presign";
import { setSignRoutes } from "./sign";
import { setSignEd25519Routes } from "./sign_ed25519";
import { setWalletEd25519Routes } from "./wallet_ed25519";
import { setUserRoutes } from "./user";
import { setTssSessionRoutes } from "./tss_session";
import { setKSNodeTelemetryRoutes } from "./ks_node_telemetry";

export function makeTssRouter() {
  const router = express.Router();

  setKeygenRoutes(router);
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
