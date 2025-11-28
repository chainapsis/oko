import express, { type IRouter } from "express";

import { setUserAuthRoutes } from "@oko-wallet-usrd-api/routes/user_auth";
import { setUserRoutes } from "@oko-wallet-usrd-api/routes/user";

export function makeUserRouter() {
  const router = express.Router() as IRouter;

  setUserAuthRoutes(router);
  setUserRoutes(router);

  return router;
}
