import type { KSNodeApiErrorResponse } from "@oko-wallet/ksn-interface/response";
import type { Request, Response, NextFunction } from "express";
import { createHash, timingSafeEqual } from "crypto";

import { ErrorCodeMap } from "@oko-wallet-ksn-server/error";

export interface AdminAuthenticatedRequest<T = any> extends Request {
  body: T;
}

function timingSafeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function adminAuthMiddleware(
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password || typeof password !== "string") {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNAUTHORIZED",
      msg: "Admin password is required",
    };
    return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
  }

  if (!adminPassword || !timingSafeCompare(password, adminPassword)) {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNAUTHORIZED",
      msg: "Invalid admin password",
    };
    return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
  }

  next();
  return;
}
