import { registry } from "@oko-wallet/oko-api-openapi";
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/common";
import { CustomerAuthHeaderSchema } from "@oko-wallet/oko-api-openapi/ct_dashboard";
import express, { type IRouter, type Response } from "express";

import type { OkoApiResponse } from "@oko-wallet-types/api_response";
import type { Customer } from "@oko-wallet-types/customers";
import {
  type CustomerAuthenticatedRequest,
  customerJwtMiddleware,
} from "@oko-wallet-usrd-api/middleware/auth";
import { setUserRoutes } from "@oko-wallet-usrd-api/routes/user";
import { setUserAuthRoutes } from "@oko-wallet-usrd-api/routes/user_auth";

export function makeUserRouter() {
  const router = express.Router() as IRouter;

  setUserAuthRoutes(router);
  setUserRoutes(router);

  registry.registerPath({
    method: "post",
    path: "/user_dashboard/v1/customer/get_connected_apps",
    tags: ["Customer Dashboard"],
    summary: "Get connected apps",
    description: "Retrieves connected applications for the authenticated user",
    security: [{ customerAuth: [] }],
    request: {
      headers: CustomerAuthHeaderSchema,
    },
    responses: {
      200: {
        description: "Connected apps retrieved successfully",
        content: {
          "application/json": {
            schema: SuccessResponseSchema,
          },
        },
      },
      401: {
        description: "User not authenticated",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
  router.post(
    "/customer/get_connected_apps",
    customerJwtMiddleware,
    async (
      req: CustomerAuthenticatedRequest,
      res: Response<OkoApiResponse<Customer>>,
    ) => {
      try {
        const state = req.app.locals as any;

        //   const customerRes = await getCustomerByUserId(
        //     state.db,
        //     res.locals.user_id,
        //   );
        //
        //   if (!customerRes.success) {
        //     res.status(500).json({
        //       success: false,
        //       code: "UNKNOWN_ERROR",
        //       msg: customerRes.err,
        //     });
        //     return;
        //   }
        //
        //   if (customerRes.data === null) {
        //     res.status(404).json({
        //       success: false,
        //       code: "CUSTOMER_NOT_FOUND",
        //       msg: "Customer not found",
        //     });
        //     return;
        //   }
        //
        //   res.status(200).json({
        //     success: true,
        //     data: customerRes.data,
        //   });
        //   return;
      } catch (error) {
        console.error("Get customer info error:", error);
        res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: "Internal server error",
        });
        return;
      }
    },
  );

  return router;
}
