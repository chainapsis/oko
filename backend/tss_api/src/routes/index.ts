import express from "express";

import { setKeygenRoutes } from "./keygen";
import { setKeygenEd25519Routes } from "./keygen_ed25519";
import { setTriplesRoutes } from "./triples";
import { setPresignRoutes } from "./presign";
import { setPresignEd25519Routes } from "./presign_ed25519";
import { setSignRoutes } from "./sign";
import { setSignEd25519Routes } from "./sign_ed25519";
import { setWalletEd25519Routes } from "./wallet_ed25519";
import { setUserRoutes } from "./user";
import { setTssSessionRoutes } from "./tss_session";

export function makeTssRouter() {
  const router = express.Router();

  setKeygenRoutes(router);
  setKeygenEd25519Routes(router);
  setTriplesRoutes(router);
  setPresignRoutes(router);
  setPresignEd25519Routes(router);
  setSignRoutes(router);
  setSignEd25519Routes(router);
  setWalletEd25519Routes(router);
  setUserRoutes(router);
  setTssSessionRoutes(router);

  return router;
}
