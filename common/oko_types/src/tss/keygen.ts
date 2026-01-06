import type { KeygenOutput } from "@oko-wallet/tecdsa-interface";

import type { AuthType, OAuthRequest } from "../auth";

export interface KeygenRequest {
  auth_type: AuthType;
  user_identifier: string;
  keygen_2: KeygenOutput;
  email?: string;
  name?: string;
}

export type KeygenBody = {
  keygen_2: KeygenOutput;
};

export type KeygenRequestBody = OAuthRequest<KeygenBody>;
