import type { Request } from "express";
import type { AuthType } from "@oko-wallet/ksn-interface/user";
import type { OAuthUser } from "@oko-wallet-ksn-server/auth/types";

type OAuthBody = {
  auth_type?: AuthType;
};

export interface KSNodeRequest<T = any>
  extends Request<any, any, T & OAuthBody> {}

export interface ResponseLocal {
  oauth_user: OAuthUser;
}
