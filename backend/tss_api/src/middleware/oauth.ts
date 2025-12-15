import type { Request, Response, NextFunction } from "express";

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

export type OAuthProvider = "google" | "auth0" | "x" | "telegram" | "discord";

export interface OAuthBody {
  auth_type: OAuthProvider;
}

export type OAuthAuthenticatedRequest<T = {}> = Request<
  any,
  any,
  OAuthBody & T
>;

export async function oauthMiddleware(
  req: OAuthAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  // default to google if auth_type is not provided
  const authType = req.body?.auth_type ?? "google";
  switch (authType) {
    case "google":
      return googleAuthMiddleware(req as GoogleAuthenticatedRequest, res, next);
    // TODO: Revise this for social login feature release in the future. @chihunmanse
    // case "auth0":
    //   return auth0AuthMiddleware(req as Auth0AuthenticatedRequest, res, next);
    // case "x":
    //   return xAuthMiddleware(req as XAuthenticatedRequest, res, next);
    // case "telegram":
    //   return telegramAuthMiddleware(
    //     req as TelegramAuthenticatedRequest,
    //     res,
    //     next,
    //   );
    // case "discord":
    //   return discordAuthMiddleware(
    //     req as DiscordAuthenticatedRequest,
    //     res,
    //     next,
    //   );
    default:
      res.status(400).json({
        error: `Invalid auth_type: ${authType}. Must be 'google', 'auth0', 'x', or 'telegram'`,
      });
      return;
  }
}
