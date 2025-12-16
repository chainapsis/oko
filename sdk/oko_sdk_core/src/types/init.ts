import type { AuthType } from "@oko-wallet/oko-types/auth";

export type InitPayload = {
  auth_type: AuthType | null;
  email: string | null;
  public_key: string | null;
  name?: string;
};
