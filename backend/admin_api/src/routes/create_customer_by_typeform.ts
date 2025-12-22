import type { Request, Response } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type { CreateCustomerResponse } from "@oko-wallet/oko-types/admin";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";

import { createCustomerByTypeform } from "@oko-wallet-admin-api/api/customer";
import {
  type TypeformWebhookBody,
  extractTypeformData,
} from "@oko-wallet-admin-api/api/customer/typeform";

export async function create_customer_by_typeform(
  req: Request,
  res: Response<OkoApiResponse<CreateCustomerResponse>>,
): Promise<void> {
  const payloadBuffer = req.body as Buffer;
  const payloadString = payloadBuffer.toString("utf8");
  const body = JSON.parse(payloadString) as TypeformWebhookBody;
  const extracted = extractTypeformData(body);

  if (!extracted.email || !extracted.appName) {
    res.status(400).json({
      success: false,
      code: "INVALID_REQUEST",
      msg: "Email and app name are required",
    });
    return;
  }

  const state = req.app.locals;
  const createCustomerRes = await createCustomerByTypeform(
    state.db,
    extracted,
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
    },
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
