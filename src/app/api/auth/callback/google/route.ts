import { NextResponse } from "next/server";
import { mutateDb, nowIso } from "@/lib/store/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_credentials`);
  }

  try {
    // 1. Tukar code dengan access_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Google token exchange error:", errText);
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string; id_token?: string };

    // 2. Ambil data profil dari Google UserInfo endpoint
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${appUrl}/login?error=userinfo_failed`);
    }

    const googleUser = (await userInfoRes.json()) as {
      sub: string;
      name: string;
      given_name?: string;
      email: string;
      picture?: string;
    };

    // 3. Simpan data user ke tradelog database
    const profile = await mutateDb(
      (db) => {
        db.profile.name = googleUser.name || db.profile.name;
        db.profile.email = googleUser.email;
        db.profile.avatar_url = googleUser.picture || db.profile.avatar_url;
        db.profile.updated_at = nowIso();
        return { ...db.profile };
      },
      { keepSample: true }
    );

    const sessionPayload = {
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      provider: "google",
      logged_in_at: Date.now(),
    };

    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    response.cookies.set("tradelog_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return response;
  } catch (err) {
    console.error("Google auth callback exception:", err);
    return NextResponse.redirect(`${appUrl}/login?error=server_error`);
  }
}
