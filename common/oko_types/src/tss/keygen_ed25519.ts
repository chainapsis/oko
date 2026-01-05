import type { TeddsaKeygenOutput } from "@oko-wallet/teddsa-interface";

import type { AuthType, OAuthRequest } from "../auth";

export interface TeddsaKeygenOutputWithPublicKey extends TeddsaKeygenOutput {
  public_key: number[];
}

export interface KeygenEd25519Request {
  auth_type: AuthType;
  email: string;
  keygen_2: TeddsaKeygenOutputWithPublicKey;
  name?: string;
}

export type KeygenEd25519Body = {
  keygen_2: TeddsaKeygenOutputWithPublicKey;
};

export type KeygenEd25519RequestBody = OAuthRequest<KeygenEd25519Body>;
