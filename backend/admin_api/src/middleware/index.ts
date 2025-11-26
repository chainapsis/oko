import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

import { verifyAdminToken } from "@oko-wallet-admin-api/auth";
import type { AuditContext } from "@oko-wallet-admin-api/utils/audit";

export type AuthenticatedAdminRequest<T = any> = Request<any, any, T, any> & {
  auditContext?: AuditContext;
};

export function adminAuthMiddleware(
  req: Request & { auditContext?: AuditContext },
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authorization header with Bearer token required",
    });
    return;
  }

  const token = authHeader.substring(7);

  const state = req.app.locals;
  const verifyResult = verifyAdminToken({
    token,
    jwt_config: {
      secret: state.jwt_secret,
    },
  });

  if (!verifyResult.success) {
    res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      error: verifyResult.err || "Invalid token",
    });
    return;
  }

  res.locals.admin = {
    user_id: verifyResult.data.sub,
    role: verifyResult.data.role,
    type: verifyResult.data.type,
  };

  const auditContext: AuditContext = {
    db: req.app.locals.db,
    adminUserId: verifyResult.data.sub,
    request: req,
    requestId: uuidv4(),
  };

  req.auditContext = auditContext;
  next();
  return;
}

export { typeformWebhookMiddleware } from "./typeform_webhook";
