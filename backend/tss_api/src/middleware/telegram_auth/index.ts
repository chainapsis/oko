import type { Request, Response, NextFunction } from "express";
import type { AuthType } from "@oko-wallet/oko-types/auth";

import {
  validateTelegramHash,
  type TelegramUserData,
  type TelegramUserInfo,
} from "@oko-wallet-tss-api/middleware/telegram_auth/validate";
import type { OAuthLocals } from "@oko-wallet-tss-api/middleware/types";

export interface TelegramAuthenticatedRequest<T = any> extends Request {
  body: T;
}

export async function telegramAuthMiddleware(
  req: TelegramAuthenticatedRequest,
  res: Response<unknown, OAuthLocals>,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Authorization header with Bearer token required",
    });
    return;
  }

  const bearerToken = authHeader.substring(7).trim(); // skip "Bearer "

  let userData: TelegramUserData;
  try {
    userData = JSON.parse(bearerToken) as TelegramUserData;
  } catch (error) {
    res.status(401).json({
      error: "Invalid token format: Expected JSON string",
    });
    return;
  }

  try {
    const telegramBotToken = req.app.locals.telegram_bot_token;
    const result = validateTelegramHash(userData, telegramBotToken);
    if (!result.success) {
      res.status(401).json({ error: result.err });
      return;
    }

    if (!result.data) {
      res.status(500).json({
        error: "Internal server error: User info missing after validation",
      });
      return;
    }

    const userInfo: TelegramUserInfo = result.data;

    res.locals.oauth_user = {
      type: "telegram" as AuthType,
      // in telegram, use telegram id as email
      email: userInfo.id,
      name: userInfo.username,
    };

    next();
    return;
  } catch (error) {
    res.status(500).json({
      error: `Hash validation failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return;
  }
}
