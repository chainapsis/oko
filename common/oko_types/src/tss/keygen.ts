import type { KeygenOutput } from "@oko-wallet/tecdsa-interface";

import type { AuthType, OAuthRequest } from "../auth";

export interface KeygenRequest {
  auth_type: AuthType;
  email: string;
  keygen_2: KeygenOutput;
  name?: string;
}

export type KeygenBody = {
  keygen_2: KeygenOutput;
};

export type KeygenRequestBody = OAuthRequest<KeygenBody>;
