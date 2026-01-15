import express, { type IRouter } from "express";

import { setCustomerRoutes } from "@oko-wallet-ctd-api/routes/customer";
import { setCustomerAuthRoutes } from "@oko-wallet-ctd-api/routes/customer_auth";

export function makeCustomerRouter() {
  const router = express.Router() as IRouter;

  setCustomerAuthRoutes(router);
  setCustomerRoutes(router);

  return router;
}
