import type { Response } from "express";

import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  DeleteCustomerAndCustomerDashboardUsersRequest,
  DeleteCustomerAndCustomerDashboardUsersResponse,
} from "@oko-wallet/oko-types/customers";
import { deleteCustomerAndUsers } from "@oko-wallet-admin-api/api/customer";
import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";

export async function delete_customer(
  req: AuthenticatedAdminRequest<DeleteCustomerAndCustomerDashboardUsersRequest>,
  res: Response<
    OkoApiResponse<DeleteCustomerAndCustomerDashboardUsersResponse>
  >,
) {
  const state = req.app.locals;
  const { customer_id: customerId } = req.params;

  if (!customerId) {
    res.status(400).json({
      success: false,
      code: "MISSING_CUSTOMER_ID",
      msg: "Customer ID is required",
    });
    return;
  }

  const deleteCustomerAndUsersRes = await deleteCustomerAndUsers(
    state.db,
    customerId,
  );
  if (deleteCustomerAndUsersRes.success === false) {
    res
      .status(ErrorCodeMap[deleteCustomerAndUsersRes.code] ?? 500)
      .json(deleteCustomerAndUsersRes);
    return;
  }

  res.status(200).json({
    success: true,
    data: deleteCustomerAndUsersRes.data,
  });
  return;
}
