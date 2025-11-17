import type { KeygenOutput } from "@oko-wallet/tecdsa-interface";

import type { OAuthRequest } from "../auth";

export interface KeygenRequest {
  email: string;
  keygen_2: KeygenOutput;
}

export type KeygenBody = {
  keygen_2: KeygenOutput;
};

export type KeygenRequestBody = OAuthRequest<KeygenBody>;
