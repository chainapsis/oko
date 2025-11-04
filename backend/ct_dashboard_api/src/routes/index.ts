import express, { type IRouter } from "express";

import { setCustomerAuthRoutes } from "@oko-wallet-ctd-api/routes/customer_auth";
import { setCustomerRoutes } from "@oko-wallet-ctd-api/routes/customer";

export function makeCustomerRouter() {
  const router = express.Router() as IRouter;

  setCustomerAuthRoutes(router);
  setCustomerRoutes(router);

  return router;
}
