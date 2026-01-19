import express from "express";

// import { setSocialLoginRoutes } from "./social_login";
import { setReferralRoutes, setReferralRoutesV2 } from "./referral";
import type { Response, Router, Request } from "express";
import type { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import type {
  SocialLoginXVerifyUserResponse,
  SocialLoginXBody,
  SocialLoginXResponse,
} from "@oko-wallet/oko-types/social_login";
import { registry } from "@oko-wallet/oko-api-openapi";
import { ErrorResponseSchema } from "@oko-wallet/oko-api-openapi/common";
import {
  SocialLoginXRequestSchema,
  SocialLoginXSuccessResponseSchema,
  SocialLoginXVerifyUserSuccessResponseSchema,
  XAuthHeaderSchema,
} from "@oko-wallet/oko-api-openapi/social_login";

import { getXUserInfo } from "@oko-wallet-api/api/x";
// import {
//   X_CLIENT_ID,
//   X_SOCIAL_LOGIN_TOKEN_URL,
// } from "@oko-wallet-social-login-api/constants/x";
// import { rateLimitMiddleware } from "@oko-wallet-social-login-api/middleware/rate_limit";
import { getXToken } from "./get_x_token";
import { verifyXUser } from "./verify_x_user";
import { rateLimitMiddleware } from "@oko-wallet-api/middleware/rate_limit";

export function makeSocialLoginRouter() {
  const router = express.Router();

  router.post(
    "/x/get-token",
    rateLimitMiddleware({ windowSeconds: 60, maxRequests: 10 }),
    getXToken,
  );

  router.get(
    "/x/verify-user",
    rateLimitMiddleware({ windowSeconds: 60, maxRequests: 10 }),
    verifyXUser,
  );

  setReferralRoutes(router);

  return router;
}
