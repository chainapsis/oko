import type { Response, Router } from "express";
import { ErrorCodeMap } from "@oko-wallet/oko-api-error-codes";
import {
  ErrorResponseSchema,
  UserAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/common";
import {
  ApiKeyAndUserAuthHeaderSchema,
  TriplesStep10RequestSchema,
  TriplesStep10SuccessResponseSchema,
  TriplesStep11RequestSchema,
  TriplesStep11SuccessResponseSchema,
  TriplesStep1RequestSchema,
  TriplesStep1SuccessResponseSchema,
  TriplesStep2RequestSchema,
  TriplesStep2SuccessResponseSchema,
  TriplesStep3RequestSchema,
  TriplesStep3SuccessResponseSchema,
  TriplesStep4RequestSchema,
  TriplesStep4SuccessResponseSchema,
  TriplesStep5RequestSchema,
  TriplesStep5SuccessResponseSchema,
  TriplesStep6RequestSchema,
  TriplesStep6SuccessResponseSchema,
  TriplesStep7RequestSchema,
  TriplesStep7SuccessResponseSchema,
  TriplesStep8RequestSchema,
  TriplesStep8SuccessResponseSchema,
  TriplesStep9RequestSchema,
  TriplesStep9SuccessResponseSchema,
} from "@oko-wallet/oko-api-openapi/tss";
import type {
  TriplesStep10Body,
  TriplesStep10Response,
  TriplesStep11Body,
  TriplesStep11Response,
  TriplesStep1Body,
  TriplesStep1Response,
  TriplesStep2Body,
  TriplesStep2Response,
  TriplesStep3Body,
  TriplesStep3Response,
  TriplesStep4Body,
  TriplesStep4Response,
  TriplesStep5Body,
  TriplesStep5Response,
  TriplesStep6Body,
  TriplesStep6Response,
  TriplesStep7Body,
  TriplesStep7Response,
  TriplesStep8Body,
  TriplesStep8Response,
  TriplesStep9Body,
  TriplesStep9Response,
} from "@oko-wallet/oko-types/tss";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";

import {
  runTriplesStep1,
  runTriplesStep2,
  runTriplesStep3,
  runTriplesStep4,
  runTriplesStep5,
  runTriplesStep6,
  runTriplesStep7,
  runTriplesStep8,
  runTriplesStep9,
  runTriplesStep10,
  runTriplesStep11,
} from "@oko-wallet-tss-api/api/v1/triples";
import {
  type UserAuthenticatedRequest,
  userJwtMiddlewareV2,
  sendResponseWithNewToken,
} from "@oko-wallet-tss-api/middleware/keplr_auth";
import { apiKeyMiddleware } from "@oko-wallet-tss-api/middleware/api_key_auth";
import { tssActivateMiddleware } from "@oko-wallet-tss-api/middleware/tss_activate";
import { registry } from "@oko-wallet/oko-api-openapi";

registry.registerPath({
  method: "post",
  path: "/tss/v1/triples/step6",
  tags: ["TSS"],
  summary: "Execute step 6 of triples generation",
  description: "Processes batch random OT messages",
  security: [{ userAuth: [] }],
  request: {
    headers: UserAuthHeaderSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: TriplesStep6RequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successfully processed step 6",
      content: {
        "application/json": {
          schema: TriplesStep6SuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
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

export async function triplesStep6(
  req: UserAuthenticatedRequest<TriplesStep6Body>,
  res: Response<OkoApiResponse<TriplesStep6Response>>,
) {
  const state = req.app.locals as any;
  const user = res.locals.user;
  const body = req.body;

  const runTriplesStep6Res = await runTriplesStep6(state.db, {
    email: user.email.toLowerCase(),
    wallet_id: user.wallet_id_secp256k1,
    session_id: body.session_id,
    batch_random_ot_wait_0: body.batch_random_ot_wait_0,
  });
  if (runTriplesStep6Res.success === false) {
    res
      .status(ErrorCodeMap[runTriplesStep6Res.code] ?? 500)
      .json(runTriplesStep6Res);
    return;
  }

  sendResponseWithNewToken(res, runTriplesStep6Res.data);
}
