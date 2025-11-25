import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    const response = await fetch("https://api.x.com/2/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.errors?.[0]?.message ||
          errorData.detail ||
          errorData.title ||
          errorMessage;
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

    const responseData = await response.json();
    const userData = responseData.data;

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      username: userData.username,
      email: undefined, // v2 API does not support email field
    });
  } catch (error) {
    console.error("Get user info error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
