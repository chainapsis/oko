import express from "express";

import { setEcdsaPublicKeyRoutes } from "./ecdsa_public_key";

export function makeCrRouter() {
  const router = express.Router();

  setEcdsaPublicKeyRoutes(router);

  return router;
}
