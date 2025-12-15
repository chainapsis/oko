import express from "express";

import { setAttachedThemeRoutes } from "@oko-wallet-attached-api/routes/theme";

export function makeAttachedRouter() {
  const router = express.Router();

  setAttachedThemeRoutes(router);

  return router;
}
