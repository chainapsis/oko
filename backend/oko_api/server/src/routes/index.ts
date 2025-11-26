import { type Express } from "express";
import { makeCustomerRouter } from "@oko-wallet/ct-dashboard-api";
import { makeOkoAdminRouter } from "@oko-wallet/admin-api";
import { makeTssRouter } from "@oko-wallet/tss-api";
import { makeUserRouter } from "@oko-wallet/user-dashboard-api";
import { makeLogRouter } from "@oko-wallet/log-api";

export function setRoutes(app: Express) {
  app.use("/customer_dashboard/v1", makeCustomerRouter());
  app.use("/oko_admin/v1", makeOkoAdminRouter());
  app.use("/tss/v1", makeTssRouter());
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

  app.get("/status", (_req, res) => {
    res.json({ gitHead: app.locals.git_hash });
  });
}
