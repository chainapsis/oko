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
  path: "/tss/v2/sign/step1",
  tags: ["TSS"],
  summary: "Initiate signing process using completed presign",
  description: "Creates sign stage and generates initial sign messages",
  security: [{ userAuth: [] }],
  request: {
    headers: UserAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: SignStep1RequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully initialized signing process",
      content: {
        "application/json": {
          schema: SignStep1SuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request - Session or stage validation failed",
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

export async function signStep1(
  req: UserAuthenticatedRequest<SignStep1Body>,
  res: Response<OkoApiResponse<SignStep1Response>>,
) {
  const state = req.app.locals as any;
  const user = res.locals.user;
  const body = req.body;

  const runSignStep1Res = await runSignStep1(state.db, {
    email: user.email.toLowerCase(),
    wallet_id: user.wallet_id_secp256k1,
    session_id: body.session_id,
    msg: body.msg,
    msgs_1: body.msgs_1,
  });
  if (runSignStep1Res.success === false) {
    res.status(ErrorCodeMap[runSignStep1Res.code] ?? 500).json(runSignStep1Res);

    return;
  }

  sendResponseWithNewToken(res, runSignStep1Res.data);
}
