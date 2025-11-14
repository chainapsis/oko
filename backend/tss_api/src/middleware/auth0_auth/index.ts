import type { Request, Response, NextFunction } from "express";

import { validateAuth0IdToken } from "./validate";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "./client_id";

export interface Auth0AuthenticatedRequest<T = any> extends Request {
  body: T;
}

export async function auth0AuthMiddleware(
  req: Auth0AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Authorization header with Bearer token required" });
    return;
  }

  const idToken = authHeader.substring(7).trim();
  const email = typeof req.body === "object" ? (req.body as any)?.email : null;

  if (!email || typeof email !== "string") {
    res.status(400).json({
      error: "Request body must include email for Auth0 verification",
    });
    return;
  }

  try {
    const result = await validateAuth0IdToken({
      idToken,
      expectedEmail: email,
      clientId: AUTH0_CLIENT_ID,
      domain: AUTH0_DOMAIN,
    });

    if (!result.success) {
      res.status(401).json({ error: result.err });
      return;
    }

    res.locals.auth0_user = result.data;
    next();
  } catch (error: any) {
    res.status(500).json({
      error: `Auth0 token validation failed: ${error}`,
    });
  }
}
