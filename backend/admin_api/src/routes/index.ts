import express from "express";

import { setCustomerRoutes } from "@oko-wallet-admin-api/routes/customer";
import { setWalletRoutes } from "@oko-wallet-admin-api/routes/ewallet_wallet";
import { setUserRoutes } from "@oko-wallet-admin-api/routes/user";
import { setTssRoutes } from "@oko-wallet-admin-api/routes/tss";
import { setKSNodeRoutes } from "@oko-wallet-admin-api/routes/ks_node";

export function makeEWalletAdminRouter() {
  const router = express.Router();

  setCustomerRoutes(router);
  setUserRoutes(router);
  setTssRoutes(router);
  setWalletRoutes(router);
  setKSNodeRoutes(router);

  return router;
}
