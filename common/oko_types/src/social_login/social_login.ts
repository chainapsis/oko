export type SocialLoginXBody = {
  code: string;
  code_verifier: string;
};

export type SocialLoginDiscordBody = {
  code: string;
};

export type SocialLoginGetTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

export type SocialLoginXVerifyUserResponse = {
  id: string;
  name: string;
  username: string;
  email?: string;
};
