import rateLimit from "express-rate-limit";

import type { OkoApiErrorResponse } from "@oko-wallet/oko-types/api_response";

export interface RateLimitMiddlewareOption {
  windowSeconds: number;
  maxRequests: number;
}

export function rateLimitMiddleware(option: RateLimitMiddlewareOption) {
  const message: OkoApiErrorResponse = {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    msg: `Too many requests, please try again after ${option.windowSeconds} seconds`,
  };

  return rateLimit({
    windowMs: option.windowSeconds * 1000,
    max: option.maxRequests,
    message,
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
