import type { Response } from "express";
import type {
  ResendCustomerUserPasswordRequest,
  ResendCustomerUserPasswordResponse,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware";
import { resendCustomerUserPassword } from "@oko-wallet-admin-api/api/customer";

export async function resend_customer_user_password(
  req: AuthenticatedAdminRequest<ResendCustomerUserPasswordRequest>,
  res: Response<OkoApiResponse<ResendCustomerUserPasswordResponse>>,
) {
  const state = req.app.locals;
  const { customer_id: customerId, email } = req.body;

  if (!customerId) {
    res.status(400).json({
      success: false,
      code: "MISSING_CUSTOMER_ID",
      msg: "Customer ID is required",
    });
    return;
  }

  if (!email) {
    res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      msg: "Email is required",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      msg: "Invalid email format",
    });
    return;
  }

  const resendPasswordRes = await resendCustomerUserPassword(
    state.db,
    {
      customer_id: customerId,
      email,
    },
    {
      email: {
        fromEmail: state.from_email,
        smtpConfig: {
          smtp_host: state.smtp_host,
          smtp_port: state.smtp_port,
          smtp_user: state.smtp_user,
          smtp_pass: state.smtp_pass,
        },
      },
    },
  );

  if (resendPasswordRes.success === false) {
    res
      .status(ErrorCodeMap[resendPasswordRes.code] ?? 500)
      .json(resendPasswordRes);
    return;
  }

  res.status(200).json({
    success: true,
    data: resendPasswordRes.data,
  });
  return;
}
