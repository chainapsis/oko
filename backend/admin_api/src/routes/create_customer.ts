import type { Response } from "express";
import type {
  CreateCustomerResponse,
  CreateCustomerWithDashboardUserRequest,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware/auth";
import { createCustomer } from "@oko-wallet-admin-api/api/customer";

export async function create_customer(
  req: AuthenticatedAdminRequest<CreateCustomerWithDashboardUserRequest> & {
    file?: Express.Multer.File;
  },
  res: Response<OkoApiResponse<CreateCustomerResponse>>,
) {
  const body = req.body;
  const state = req.app.locals;

  if (!body || !body.email || !body.label) {
    res.status(400).json({
      success: false,
      code: "INVALID_EMAIL_OR_LABEL",
      msg: "Email and label are required",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    res.status(400).json({
      success: false,
      code: "INVALID_EMAIL_OR_LABEL",
      msg: "Invalid email format",
    });
    return;
  }

  const createCustomerRes = await createCustomer(
    state.db,
    body,
    {
      s3: {
        region: state.s3_region,
        accessKeyId: state.s3_access_key_id,
        secretAccessKey: state.s3_secret_access_key,
        bucket: state.s3_bucket,
      },
      email: {
        fromEmail: state.from_email,
        smtpConfig: {
          smtp_host: state.smtp_host,
          smtp_port: state.smtp_port,
          smtp_user: state.smtp_user,
          smtp_pass: state.smtp_pass,
        },
      },
      logo: req.file
        ? { buffer: req.file.buffer, originalname: req.file.originalname }
        : null,
    },
    req.auditContext,
  );
  if (createCustomerRes.success === false) {
    res
      .status(ErrorCodeMap[createCustomerRes.code] ?? 500)
      .json(createCustomerRes);
    return;
  }

  res.status(201).json({
    success: true,
    data: createCustomerRes.data,
  });
  return;
}
