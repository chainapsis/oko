import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import { handleGoogleSignIn } from "./google";
import { handleEmailSignIn } from "./email";
import { handleXSignIn } from "./x";
import { handleTelegramSignIn } from "./telegram";

export async function signIn(
  this: OkoWalletInterface,
  type: "google" | "email" | "x" | "telegram",
) {
  await this.waitUntilInitialized;

  try {
    switch (type) {
      case "google":
        await handleGoogleSignIn(this);
        break;
      case "email":
        await handleEmailSignIn(this);
        break;
      case "x":
        await handleXSignIn(this);
        break;
      case "telegram":
        await handleTelegramSignIn(this);
        break;
      default:
        throw new Error(`not supported sign in type, type: ${type}`);
    }
  } catch (err) {
    throw new Error(`Sign in error, err: ${err}`);
  }

  const publicKey = await this.getPublicKey();
  const email = await this.getEmail();

  if (!!publicKey && !!email) {
    console.log("[oko] emit CORE__accountsChanged");

    this.eventEmitter.emit({
      type: "CORE__accountsChanged",
      email,
      publicKey,
    });
  }
}
