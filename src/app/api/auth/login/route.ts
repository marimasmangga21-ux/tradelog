import { NextResponse } from "next/server";
import { mutateDb, nowIso } from "@/lib/store/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      mode?: "login" | "signup" | "reset";
      name?: string;
    };

    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    // Reset password mode
    if (body.mode === "reset") {
      return NextResponse.json({
        ok: true,
        message: "Link reset password terkirim ke email jika akun terdaftar.",
      });
    }

    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Ekstrak nama pengguna yang baik
    const fallbackName =
      body.name ||
      (email === "marimasmangga21@gmail.com"
        ? "Evan Mita"
        : email
            .split("@")[0]
            .split(/[._-]/)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ") || "Trader");

    const avatarUrl =
      email === "marimasmangga21@gmail.com"
        ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan"
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    const updatedProfile = await mutateDb(
      (db) => {
        db.profile.name = fallbackName;
        db.profile.email = email;
        db.profile.avatar_url = avatarUrl;
        db.profile.updated_at = nowIso();
        return { ...db.profile };
      },
      { keepSample: true }
    );

    const sessionPayload = {
      name: updatedProfile.name,
      email: updatedProfile.email,
      avatar_url: updatedProfile.avatar_url,
      provider: "credentials",
      logged_in_at: Date.now(),
    };

    const response = NextResponse.json({
      ok: true,
      user: updatedProfile,
    });

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
        error: error instanceof Error ? error.message : "Gagal memproses autentikasi",
      },
      { status: 500 }
    );
  }
}
