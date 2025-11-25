import { NextRequest, NextResponse } from "next/server";

import {
  TWITTER_CLIENT_ID,
  REDIRECT_URI,
  TWITTER_TOKEN_URL,
} from "@oko-wallet-demo-web/app/twitter-oauth/utils/twitter-oauth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, code_verifier } = body;

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: "Missing code or code_verifier" },
        { status: 400 },
      );
    }

    // Request token exchange to Twitter API (no CORS issue on server side)
    const response = await fetch(TWITTER_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: code_verifier,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error_description || errorData.error || errorMessage;
      } catch {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const tokenData = await response.json();
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
