import { Router } from "express";

import { bearerTokenMiddleware } from "@oko-wallet-ksn-server/middlewares";
import { getKeysharesV2 } from "./get_key_shares";
import { keyshareV2Check } from "./check";
import { keyshareV2Register } from "./register";
import { registerKeyshareEd25519 } from "./ed25519";
import { keyshareV2Reshare } from "./reshare";
import { keyshareV2ReshareRegister } from "./reshare_register";

export function makeKeyshareV2Router() {
  const router = Router();

  router.post("/", bearerTokenMiddleware, getKeysharesV2);

  router.post("/check", keyshareV2Check);

  router.post("/register", bearerTokenMiddleware, keyshareV2Register);

  router.post(
    "/register/ed25519",
    bearerTokenMiddleware,
    registerKeyshareEd25519,
  );

  router.post("/reshare", bearerTokenMiddleware, keyshareV2Reshare);

  router.post(
    "/reshare/register",
    bearerTokenMiddleware,
    keyshareV2ReshareRegister,
  );

  return router;
}
