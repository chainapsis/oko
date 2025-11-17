import type { Request } from "express";
import type { OAuthProvider } from "@oko-wallet-ksn-server/auth/types";

type OAuthBody = {
  auth_type?: OAuthProvider;
};

export interface KSNodeRequest<T = any>
  extends Request<any, any, T & OAuthBody> {}

export interface ResponseLocal {
  oauth_user: {
    type: OAuthProvider;
    email: string;
    name?: string;
    sub: string;
  };
}
