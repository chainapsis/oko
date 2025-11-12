import type { Response } from "express";
import type {
  CreateCustomerResponse,
  CreateCustomerWithDashboardUserRequest,
} from "@oko-wallet/oko-types/admin";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { type AuthenticatedAdminRequest } from "@oko-wallet-admin-api/middleware";
import { createCustomer } from "@oko-wallet-admin-api/api/customer";

export async function create_customer(
  req: AuthenticatedAdminRequest<CreateCustomerWithDashboardUserRequest> & {
    file?: Express.Multer.File;
  },
  res: Response<OkoApiResponse<CreateCustomerResponse>>,
) {
  const body = req.body;
  const state = req.app.locals;

  if (!body || !body.email || !body.password || !body.label) {
    res.status(400).json({
      success: false,
      code: "INVALID_EMAIL_OR_PASSWORD",
      msg: "Email, password, and label are required",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    res.status(400).json({
      success: false,
      code: "INVALID_EMAIL_OR_PASSWORD",
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
