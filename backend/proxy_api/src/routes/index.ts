import express from "express";

import { setProxyRoutes } from "./proxy";

export function makeProxyRouter() {
  const router = express.Router();

  setProxyRoutes(router);

  return router;
}
