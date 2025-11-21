import express from "express";

import { setEcdsaPublicKeyRoutes } from "./ecdsa-public-key";

export function makeCrRouter() {
  const router = express.Router();

  setEcdsaPublicKeyRoutes(router);

  return router;
}
