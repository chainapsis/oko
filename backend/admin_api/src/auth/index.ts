import type {
  AdminTokenPayload,
  GenerateAdminTokenArgs,
  VerifyAdminTokenArgs,
} from "@oko-wallet/oko-types/admin";
import type { TokenResult } from "@oko-wallet/oko-types/auth";
import type { Result } from "@oko-wallet/stdlib-js";
import jwt from "jsonwebtoken";

export const ADMIN_ISSUER = "https://api.oko.app";
export const ADMIN_AUDIENCE = "https://api.oko.app";

export function generateAdminToken(
  args: GenerateAdminTokenArgs,
): Result<TokenResult, string> {
  try {
    const payload: AdminTokenPayload = {
      sub: args.user_id,
      role: args.role,
      type: "admin",
    };

    const token: string = jwt.sign(payload, args.jwt_config.secret, {
      algorithm: "HS256",
      expiresIn: args.jwt_config.expires_in as jwt.SignOptions["expiresIn"],
      issuer: ADMIN_ISSUER,
      audience: ADMIN_AUDIENCE,
    });

    return {
      success: true,
      data: {
        token,
      },
    };
  } catch (error) {
    console.error("generateAdminToken error:", error);
    return {
      success: false,
      err: `Failed to generate token: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function verifyAdminToken(
  args: VerifyAdminTokenArgs,
): Result<AdminTokenPayload, string> {
  try {
    const payload = jwt.verify(args.token, args.jwt_config.secret, {
      issuer: ADMIN_ISSUER,
      audience: ADMIN_AUDIENCE,
    }) as AdminTokenPayload;

    if (payload.type !== "admin") {
      return {
        success: false,
        err: "Invalid token type",
      };
    }

    return {
      success: true,
      data: payload,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        err: `Invalid token: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        err: `Token expired: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    console.error("verifyAdminToken error:", error);
    return {
      success: false,
      err: `Token verification failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
