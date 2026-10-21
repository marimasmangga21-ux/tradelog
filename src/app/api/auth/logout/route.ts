import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("tradelog_session");
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

  const response = NextResponse.redirect(`${appUrl}/login`);
  response.cookies.delete("tradelog_session");
  return response;
}
