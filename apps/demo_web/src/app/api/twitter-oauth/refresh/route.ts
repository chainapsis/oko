import { NextRequest, NextResponse } from "next/server";

import {
  TWITTER_CLIENT_ID,
  TWITTER_TOKEN_URL,
} from "@oko-wallet-demo-web/app/twitter-oauth/utils/twitter-oauth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Missing refresh_token" },
        { status: 400 },
      );
    }

    const response = await fetch(TWITTER_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token,
        grant_type: "refresh_token",
        client_id: TWITTER_CLIENT_ID,
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
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
