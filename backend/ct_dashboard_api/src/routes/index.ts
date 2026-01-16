import express from "express";

import { setCustomerAuthRoutes } from "@oko-wallet-ctd-api/routes/customer_auth";
import { setCustomerRoutes } from "@oko-wallet-ctd-api/routes/customer";

export function makeCustomerRouter() {
  const router = express.Router();

  setCustomerAuthRoutes(router);
  setCustomerRoutes(router);

  return router;
}
