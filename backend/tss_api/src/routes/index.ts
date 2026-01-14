import express from "express";

import { setKeygenV1Routes } from "./v1/keygen";
import { setTriplesV1Routes } from "./v1/triples";
import { setPresignV1Routes } from "./v1/presign";
import { setSignV1Routes } from "./v1/sign";
import { setUserV1Routes } from "./v1/user";
import { setKeygenV2Routes } from "./v2/keygen";
import { setTriplesV2Routes } from "./v2/triples";
import { setPresignV2Routes } from "./v2/presign";
import { setSignV2Routes } from "./v2/sign";
import { setSignV2Ed25519Routes } from "./v2/sign_ed25519";
import { setWalletEd25519Routes } from "./wallet_ed25519";
import { setTssSessionRoutes } from "./tss_session";
import { setKSNodeTelemetryRoutes } from "./ks_node_telemetry";

export function makeTssRouter() {
  const router = express.Router();

  setKeygenV1Routes(router);
  setTriplesV1Routes(router);
  setPresignV1Routes(router);
  setSignV1Routes(router);
  setUserV1Routes(router);

  setKeygenV2Routes(router);
  setTriplesV2Routes(router);
  setPresignV2Routes(router);
  setSignV2Routes(router);
  setSignV2Ed25519Routes(router);

  setWalletEd25519Routes(router);
  setTssSessionRoutes(router);
  setKSNodeTelemetryRoutes(router);

  return router;
}
