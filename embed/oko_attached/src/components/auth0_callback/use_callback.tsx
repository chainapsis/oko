"use client";

import { useEffect, useState } from "react";
import { getAuth0WebAuth } from "@oko-wallet-attached/config/auth0";

interface TokensState {
  idToken: string | null;
  accessToken: string | null;
  state: string | null;
}

export function useAuth0Callback(): {
  error: string | null;
  tokens: TokensState | null;
} {
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokensState | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      setError("Missing callback parameters.");
      return;
    }

    const webAuth = getAuth0WebAuth();

    webAuth.parseHash({ hash }, (err, result) => {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );

      if (err) {
        setError(
          err.error_description ??
            err.description ??
            err.error ??
            "Auth0 callback error",
        );
        return;
      }

      if (!result || !result.idToken) {
        setError("Missing id_token in callback");
        return;
      }

      const idToken = result.idToken || null;
      const accessToken = result.accessToken || null;
      const state = result.state || null;

      setTokens({
        idToken,
        accessToken,
        state,
      });

      // TODO: Integrate with oauth_info_pass flow for Auth0 provider.
      console.log("[auth0] email login result", {
        idToken,
        accessToken,
        state,
      });
    });
  }, []);

  return { error, tokens };
}
