import type { Express } from "express";

import { makeOkoAdminRouter } from "@oko-wallet/admin-api";
import { makeAttachedRouter } from "@oko-wallet/attached-api";
import { makeCustomerRouter } from "@oko-wallet/ct-dashboard-api";
import { makeLogRouter } from "@oko-wallet/log-api";
import { makeSocialLoginRouter } from "@oko-wallet/social-login-api";
import {
  makeV1Router as makeTSSRouterV1,
  makeV2Router as makeTSSRouterV2,
} from "@oko-wallet/tss-api";
import { makeUserRouter } from "@oko-wallet/user-dashboard-api";

import { getStatus } from "./get_status";

export function setRoutes(app: Express) {
  app.use("/customer_dashboard/v1", makeCustomerRouter());

  app.use("/attached/v1", makeAttachedRouter());

  app.use("/oko_admin/v1", makeOkoAdminRouter());

  app.use("/tss/v1", makeTSSRouterV1());

  app.use("/tss/v2", makeTSSRouterV2());

  app.use("/user_dashboard/v1", makeUserRouter());

  app.use(
    "/log/v1",
    makeLogRouter({
      esUrl: app.locals.es_url,
      esIndex: app.locals.es_client_index,
      esUsername: app.locals.es_username,
      esPassword: app.locals.es_password,
    }),
  );

  app.use("/social-login/v1", makeSocialLoginRouter());

  app.get("/status", getStatus);
}
