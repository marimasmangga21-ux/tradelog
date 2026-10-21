import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb } from "@/lib/store/db";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("tradelog_session")?.value;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      return NextResponse.json({
        authenticated: true,
        hasGoogleCredentials: true,
        user: {
          name: session.name || "Trader",
          email: session.email || "",
          avatar_url: session.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
        },
      });
    } catch {
      // cookie corrupt/invalid
    }
  }

  return NextResponse.json({
    authenticated: false,
    hasGoogleCredentials: false,
    user: null,
  });
}
