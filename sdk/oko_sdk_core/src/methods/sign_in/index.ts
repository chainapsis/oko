import type { OkoWalletInterface } from "@oko-wallet-sdk-core/types";
import type { CurveType, SignInType } from "@oko-wallet-sdk-core/types/oauth";
import { handleGoogleSignIn } from "./google";
import { handleEmailSignIn } from "./email";
import { handleXSignIn } from "./x";
import { handleTelegramSignIn } from "./telegram";
import { handleDiscordSignIn } from "./discord";

export interface SignInOptions {
  curveType?: CurveType;
}

export async function signIn(
  this: OkoWalletInterface,
  type: SignInType,
  options?: SignInOptions,
) {
  await this.waitUntilInitialized;

  const curveType = options?.curveType;

  try {
    switch (type) {
      case "google":
        await handleGoogleSignIn(this, curveType);
        break;
      case "email":
        await handleEmailSignIn(this);
        break;
      case "x":
        await handleXSignIn(this, curveType);
        break;
      case "telegram":
        await handleTelegramSignIn(this, curveType);
        break;
      case "discord":
        await handleDiscordSignIn(this, curveType);
        break;
      default:
        throw new Error(`not supported sign in type, type: ${type}`);
    }
  } catch (err) {
    throw new Error(`Sign in error, err: ${err}`);
  }

  const walletInfo = await this.getWalletInfo();

  if (!walletInfo) {
    return;
  }

  if (walletInfo.publicKey && walletInfo.email) {
    console.log("[oko] emit CORE__accountsChanged");

    this.eventEmitter.emit({
      type: "CORE__accountsChanged",
      authType: walletInfo.authType,
      email: walletInfo.email,
      publicKey: walletInfo.publicKey,
      name: walletInfo.name,
    });
  }
}
