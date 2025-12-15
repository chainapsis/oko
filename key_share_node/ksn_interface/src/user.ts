export type AuthType = "google" | "auth0" | "x" | "telegram" | "discord";

export interface KSNodeUser {
  user_id: string;
  email: string;
  auth_type: AuthType;
  status: string;
  created_at: Date;
  updated_at: Date;
  aux?: Record<string, any>;
}
