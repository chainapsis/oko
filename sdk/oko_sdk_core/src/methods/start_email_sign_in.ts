import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import { sendAuth0EmailCode } from "@oko-wallet-sdk-core/auth/auth0";

export async function startEmailSignIn(
  this: OkoWalletInterface,
  email: string,
): Promise<void> {
  await this.waitUntilInitialized;

  try {
    await sendAuth0EmailCode(email);
  } catch (error: any) {
    const errorMessage =
      error?.description ??
      error?.error_description ??
      error?.message ??
      "Failed to send Auth0 email code";
    throw new Error(errorMessage);
  }
}
