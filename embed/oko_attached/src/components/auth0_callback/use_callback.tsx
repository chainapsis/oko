"use client";

import { useEffect, useState } from "react";

interface TokensState {
  idToken: string | null;
  accessToken: string | null;
  state: string | null;
}

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashString = hash.startsWith("#") ? hash.substring(1) : hash;

  hashString.split("&").forEach((part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });

  return params;
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

    try {
      const params = parseHashParams(hash);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );

      if (params.error) {
        setError(
          params.error_description || params.error || "Auth0 callback error",
        );
        return;
      }

      const idToken = params.id_token || null;
      const accessToken = params.access_token || null;
      const state = params.state || null;

      if (!idToken) {
        setError("Missing id_token in callback");
        return;
      }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse callback");
    }
  }, []);

  return { error, tokens };
}
