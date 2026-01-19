import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const USER_ISSUER = "https://api.oko.app";
const USER_AUDIENCE = "https://api.oko.app";

export interface UserAuthenticatedRequest<T = any> extends Request {
  body: T;
}

interface UserTokenPayload {
  email: string;
  wallet_id: string;
  type: string;
}

interface UserTokenPayloadV2 {
  email: string;
  wallet_id_secp256k1: string;
  wallet_id_ed25519: string;
  type: string;
}

export async function userJwtMiddleware(
  req: UserAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      msg: "Authorization header with Bearer token required",
    });
    return;
  }

  const token = authHeader.substring(7); // skip "Bearer "

  try {
    const state = req.app.locals;

    const payload = jwt.verify(token, state.jwt_secret, {
      issuer: USER_ISSUER,
      audience: USER_AUDIENCE,
      ignoreExpiration: true, // consistent with tss_api
    }) as UserTokenPayload;

    if (!payload.email || !payload.wallet_id) {
      res.status(401).json({
        success: false,
        code: "INVALID_AUTH_TOKEN",
        msg: "Invalid token payload",
      });
      return;
    }

    res.locals.user = {
      email: payload.email,
      wallet_id: payload.wallet_id,
    };

    next();
    return;
  } catch (error) {
    res.status(401).json({
      success: false,
      code: "INVALID_AUTH_TOKEN",
      msg: `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return;
  }
}

export async function userJwtMiddlewareV2(
  req: UserAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      msg: "Authorization header with Bearer token required",
    });
    return;
  }

  const token = authHeader.substring(7); // skip "Bearer "

  try {
    const state = req.app.locals;

    const payload = jwt.verify(token, state.jwt_secret, {
      issuer: USER_ISSUER,
      audience: USER_AUDIENCE,
      ignoreExpiration: true, // consistent with tss_api
    }) as UserTokenPayloadV2;

    if (
      !payload.email ||
      !payload.wallet_id_secp256k1 ||
      !payload.wallet_id_ed25519
    ) {
      res.status(401).json({
        success: false,
        code: "INVALID_AUTH_TOKEN",
        msg: "Invalid token payload",
      });
      return;
    }

    res.locals.user = {
      email: payload.email,
      wallet_id_secp256k1: payload.wallet_id_secp256k1,
      wallet_id_ed25519: payload.wallet_id_ed25519,
    };

    next();
    return;
  } catch (error) {
    res.status(401).json({
      success: false,
      code: "INVALID_AUTH_TOKEN",
      msg: `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return;
  }
}
