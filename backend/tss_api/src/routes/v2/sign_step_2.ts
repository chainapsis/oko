import type { Response, Router } from "express";
import type {
  SignStep1Body,
  SignStep1Response,
  SignStep2Body,
  SignStep2Response,
} from "@oko-wallet/oko-types/tss";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  SignStep1RequestSchema,
  SignStep1SuccessResponseSchema,
  SignStep2RequestSchema,
  SignStep2SuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/tss";
import { registry } from "@oko-wallet/oko-api-openapi";

import { runSignStep1, runSignStep2 } from "@oko-wallet-tss-api/api/v1/sign";
import {
  type UserAuthenticatedRequest,
  userJwtMiddlewareV2,
  sendResponseWithNewToken,
} from "@oko-wallet-tss-api/middleware/keplr_auth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";

registry.registerPath({
  method: "post",
  path: "/tss/v1/sign/step2",
  tags: ["TSS"],
  summary: "Complete signing process",
  description: "Validates sign result and completes sign stage",
  security: [{ userAuth: [] }],
  request: {
    headers: UserAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: SignStep2RequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully completed signing process",
      content: {
        "application/json": {
          schema: SignStep2SuccessResponseSchema,
        },
      },
    },
    400: {
      description:
        "Invalid request - Session, stage, or sign result validation failed",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - Invalid or missing JWT token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export async function signStep2(
  req: UserAuthenticatedRequest<SignStep2Body>,
  res: Response<OkoApiResponse<SignStep2Response>>,
) {
  const state = req.app.locals as any;
  const user = res.locals.user;
  const body = req.body;

  const runSignStep2Res = await runSignStep2(state.db, {
    email: user.email.toLowerCase(),
    wallet_id: user.wallet_id_secp256k1,
    session_id: body.session_id,
    sign_output: body.sign_output,
  });
  if (runSignStep2Res.success === false) {
    res.status(ErrorCodeMap[runSignStep2Res.code] ?? 500).json(runSignStep2Res);
    return;
  }

  sendResponseWithNewToken(res, runSignStep2Res.data);
}
