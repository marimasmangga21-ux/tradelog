import { NextResponse } from "next/server";
import { mutateDb, nowIso } from "@/lib/store/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (url.protocol.replace(":", "") || "https");
  const appUrl = `${proto}://${host}`;

  // Log in default session & redirect directly to /dashboard
  const sessionPayload = {
    name: "Evan Mita",
    email: "marimasmangga21@gmail.com",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
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
        { ok: false, error: "Email wajib diisi" },
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
        error: error instanceof Error ? error.message : "Gagal menyimpan session",
      },
      { status: 500 }
    );
  }
}
