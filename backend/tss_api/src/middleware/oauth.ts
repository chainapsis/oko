import type { Request, Response, NextFunction } from "express";
import type { AuthVendor } from "@oko-wallet/oko-types/user";

import {
  type GoogleAuthenticatedRequest,
  googleAuthMiddleware,
} from "@oko-wallet-tss-api/middleware/google_auth";
import {
  type Auth0AuthenticatedRequest,
  auth0AuthMiddleware,
} from "@oko-wallet-tss-api/middleware/auth0_auth";
import {
  type XAuthenticatedRequest,
  xAuthMiddleware,
} from "@oko-wallet-tss-api/middleware/x_auth";
import {
  type TelegramAuthenticatedRequest,
  telegramAuthMiddleware,
} from "@oko-wallet-tss-api/middleware/telegram_auth";
import {
  discordAuthMiddleware,
  type DiscordAuthenticatedRequest,
} from "./discord_auth";

export interface OAuthBody {
  auth_type: AuthVendor;
}

export type OAuthAuthenticatedRequest<T = {}> = Request<
  any,
  any,
  OAuthBody & T
>;

export interface OAuthLocals {
  oauth_user: { email: string };
  oauth_provider: AuthVendor;
}

export async function oauthMiddleware(
  req: OAuthAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authType = req.body?.auth_type as AuthVendor | undefined;

  if (!authType) {
    res.status(400).json({
      error: "auth_type is required in request body",
    });
    return;
  }

  // Store auth_type in res.locals for use in route handlers
  res.locals.oauth_provider = authType;

  switch (authType) {
    case "google":
      return googleAuthMiddleware(req as GoogleAuthenticatedRequest, res, next);
    case "auth0":
      return auth0AuthMiddleware(req as Auth0AuthenticatedRequest, res, next);
    case "x":
      return xAuthMiddleware(req as XAuthenticatedRequest, res, next);
    case "telegram":
      return telegramAuthMiddleware(
        req as TelegramAuthenticatedRequest,
        res,
        next,
      );
    case "discord":
      return discordAuthMiddleware(
        req as DiscordAuthenticatedRequest,
        res,
        next,
      );
    default:
      res.status(400).json({
        error: `Invalid auth_type: ${authType}. Must be 'google', 'auth0', 'x', or 'telegram'`,
      });
      return;
  }
}
