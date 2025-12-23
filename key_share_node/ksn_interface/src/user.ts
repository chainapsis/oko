import type { AuthType } from "@oko-wallet/oko-types/auth";

export interface KSNodeUser {
  user_id: string;
  email: string;
  auth_type: AuthType;
  status: string;
  created_at: Date;
  updated_at: Date;
  aux?: Record<string, any>;
}
