import { useAppState } from "@oko-wallet-attached/store/app";

import type {
  EmailLoginRequestArgs,
  EmailLoginVerifyArgs,
  EmailLoginVerificationResult,
} from "./types";

const FALLBACK_DELAY_MS = 500;

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function requestEmailLoginCode(
  args: EmailLoginRequestArgs,
): Promise<void> {
  console.log(
    "[attached][email_login] requesting code for %s (host: %s)",
    args.email,
    args.hostOrigin,
  );

  // NOTE: The actual API wiring happens in a follow-up patch.
  await wait(FALLBACK_DELAY_MS);
}

export async function verifyEmailLoginCode(
  args: EmailLoginVerifyArgs,
): Promise<EmailLoginVerificationResult> {
  console.log(
    "[attached][email_login] verifying code for %s (host: %s)",
    args.email,
    args.hostOrigin,
  );

  await wait(FALLBACK_DELAY_MS);

  throw new Error(
    "Email verification flow is not connected to the backend yet.",
  );
}

export function persistEmailLoginResult(
  hostOrigin: string,
  result: EmailLoginVerificationResult,
) {
  console.log(
    "[attached][email_login] persisting login result for %s (host: %s)",
    result.email,
    hostOrigin,
  );

  const appState = useAppState.getState();

  appState.setKeyshare_1(hostOrigin, result.keyshare_1);
  appState.setAuthToken(hostOrigin, result.authToken);
  appState.setWallet(hostOrigin, {
    walletId: result.walletId,
    publicKey: result.publicKey,
    email: result.email,
  });
}
