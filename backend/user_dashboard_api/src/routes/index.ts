import express, { type IRouter, type Response } from "express";

import { setUserAuthRoutes } from "@oko-wallet-usrd-api/routes/user_auth";
import { setUserRoutes } from "@oko-wallet-usrd-api/routes/user";
import {
  customerJwtMiddleware,
  type CustomerAuthenticatedRequest,
} from "@oko-wallet-usrd-api/middleware/auth";
import type { OkoApiResponse } from "@oko-wallet-types/api_response";
import type { Customer } from "@oko-wallet-types/customers";

export function makeUserRouter() {
  const router = express.Router() as IRouter;

  setUserAuthRoutes(router);
  setUserRoutes(router);

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
