import type { Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { Customer } from "@oko-wallet/oko-types/customers";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import type { AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { getCustomerById } from "@oko-wallet-admin-api/api/customer";

export async function get_customer(
  req: AuthenticatedAdminRequest,
  res: Response<OkoApiResponse<Customer>>,
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

  const getCustomerByIdRes = await getCustomerById(state.db, customerId);
  if (getCustomerByIdRes.success === false) {
    res
      .status(ErrorCodeMap[getCustomerByIdRes.code] ?? 500)
      .json(getCustomerByIdRes);
    return;
  }

  res.status(200).json({ success: true, data: getCustomerByIdRes.data });
  return;
}
