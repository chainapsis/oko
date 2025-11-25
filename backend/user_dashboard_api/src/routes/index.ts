import express, { type IRouter } from "express";

import { setCustomerAuthRoutes } from "@oko-wallet-usrd-api/routes/customer_auth";
import { setCustomerRoutes } from "@oko-wallet-usrd-api/routes/customer";

export function makeCustomerRouter() {
  const router = express.Router() as IRouter;

  setCustomerAuthRoutes(router);
  setCustomerRoutes(router);

  return router;
}
