export type OkoLoginProvider = "google" | "email" | "x" | "telegram" | "discord";

export interface OkoLoginMethod {
  provider: OkoLoginProvider;
}

export interface OkoWalletOptions {
  apiKey: string;
  sdkEndpoint?: string;
  loginProvider: OkoLoginProvider;
  loginMethods?: OkoLoginMethod[];
}
