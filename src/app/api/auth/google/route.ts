import { NextResponse } from "next/server";
import { mutateDb, nowIso } from "@/lib/store/db";
import { supabaseUrl } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || (url.protocol.replace(":", "") || "https");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
  const redirectUri = `${appUrl}/auth/callback`;

  // Redirect langsung ke Google OAuth via Supabase provider
  const googleAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
    redirectUri
  )}`;

  return NextResponse.redirect(googleAuthUrl);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      avatar_url?: string;
    };

    if (!body.email) {
      return NextResponse.json(
        { ok: false, error: "Email Google wajib diisi" },
        { status: 400 }
      );
    }

    const updatedProfile = await mutateDb(
      (db) => {
        db.profile.name = body.name || db.profile.name || "Trader";
        db.profile.email = body.email || db.profile.email;
        db.profile.avatar_url = body.avatar_url || db.profile.avatar_url;
        db.profile.updated_at = nowIso();
        return { ...db.profile };
      },
      { keepSample: true }
    );

    const sessionPayload = {
      name: updatedProfile.name,
      email: updatedProfile.email,
      avatar_url: updatedProfile.avatar_url,
      provider: "google",
      logged_in_at: Date.now(),
    };

    const response = NextResponse.json({
      ok: true,
      user: updatedProfile,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set("tradelog_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Gagal menyimpan session Google",
      },
      { status: 500 }
    );
  }
}
