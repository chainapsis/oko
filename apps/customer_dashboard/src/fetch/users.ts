import { OkoApiResponse } from "@oko-wallet/oko-types/api_response";
import {
  ChangePasswordResponse,
  LoginResponse,
  SendVerificationResponse,
} from "@oko-wallet/oko-types/ct_dashboard";

import { errorHandle } from "./utils";
import { CUSTOMER_V1_ENDPOINT } from "./customers";

export async function requestSignIn(
  email: string,
  password: string,
): Promise<OkoApiResponse<LoginResponse>> {
  return errorHandle<LoginResponse>(() =>
    fetch(`${CUSTOMER_V1_ENDPOINT}/customer/auth/signin`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );
}

export async function requestSendVerificationCode(
  email: string,
): Promise<OkoApiResponse<SendVerificationResponse>> {
  return errorHandle<SendVerificationResponse>(() =>
    fetch(`${CUSTOMER_V1_ENDPOINT}/customer/auth/send-code`, {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );
}

export async function requestVerifyCodeAndLogin(
  email: string,
  code: string,
): Promise<OkoApiResponse<LoginResponse>> {
  return errorHandle<LoginResponse>(() =>
    fetch(`${CUSTOMER_V1_ENDPOINT}/customer/auth/verify-login`, {
      method: "POST",
      body: JSON.stringify({ email, verification_code: code }),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );
}

export async function requestChangePassword(
  email: string,
  originalPassword: string,
  newPassword: string,
  token: string,
): Promise<OkoApiResponse<ChangePasswordResponse>> {
  return errorHandle<any>(() =>
    fetch(`${CUSTOMER_V1_ENDPOINT}/customer/auth/change-password`, {
      method: "POST",
      body: JSON.stringify({
        email,
        original_password: originalPassword,
        new_password: newPassword,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
}
