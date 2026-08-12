import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        error: "Authorization code is missing",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Salla authorization callback received",
    codeReceived: true,
  });
}