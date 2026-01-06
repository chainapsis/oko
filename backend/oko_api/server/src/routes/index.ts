import { type Express } from "express";
import { makeCustomerRouter } from "@oko-wallet/ct-dashboard-api";
import { makeOkoAdminRouter } from "@oko-wallet/admin-api";
import { makeTssRouter } from "@oko-wallet/tss-api";
import { makeUserRouter } from "@oko-wallet/user-dashboard-api";
import { makeLogRouter } from "@oko-wallet/log-api";
import { makeSocialLoginRouter } from "@oko-wallet/social-login-api";
import { makeAttachedRouter } from "@oko-wallet/attached-api";
import { registry } from "@oko-wallet/oko-api-openapi";
import { OkoApiStatusResponseSchema } from "@oko-wallet/oko-api-openapi/oko";

export function setRoutes(app: Express) {
  app.use("/customer_dashboard/v1", makeCustomerRouter());
  app.use("/attached/v1", makeAttachedRouter());
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

  app.use("/social-login/v1", makeSocialLoginRouter());

  registry.registerPath({
    method: "get",
    path: "/status",
    tags: ["Status"],
    summary: "Get API status",
    description: "Returns server git hash and public key",
    responses: {
      200: {
        description: "Status retrieved successfully",
        content: {
          "application/json": {
            schema: OkoApiStatusResponseSchema,
          },
        },
      },
    },
  });
  app.get("/status", (_req, res) => {
    res.json({
      gitHead: app.locals.git_hash,
      serverPublicKey: app.locals.server_keypair.publicKey.toHex(),
    });
  });
}
