import { NextResponse } from "next/server";
import { mutateDb, nowIso } from "@/lib/store/db";
import { supabase } from "@/lib/supabase";

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

    const origin = new URL(request.url).origin;

    // Reset password mode
    if (body.mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback`,
      });

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "Link reset password terkirim ke email Anda jika terdaftar.",
      });
    }

    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    let authUser: { id: string; email?: string; user_metadata?: Record<string, any> } | null = null;
    let authName = body.name || "";

    if (body.mode === "signup") {
      // 1. Pendaftaran akun baru di Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: body.password,
        options: {
          data: {
            full_name: authName || email.split("@")[0],
          },
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.includes("already registered") || error.status === 400) {
          msg = "Email ini sudah terdaftar. Silakan pilih tab Masuk.";
        }
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
      }

      if (!data.user) {
        return NextResponse.json(
          { ok: false, error: "Gagal membuat akun. Silakan coba lagi." },
          { status: 400 }
        );
      }

      authUser = data.user;
      authName = (data.user.user_metadata?.full_name as string) || authName || email.split("@")[0];

      // Jika Supabase mengharuskan verifikasi email dulu
      if (!data.session) {
        return NextResponse.json({
          ok: true,
          needsConfirmation: true,
          message: "Pendaftaran berhasil! Cek kotak masuk email Anda untuk konfirmasi aktivasi akun.",
        });
      }
    } else {
      // 2. Mode Login: Validasi ketat ke Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: body.password,
      });

      if (error) {
        let errorMsg = "Email atau password salah. Pastikan akun sudah terdaftar.";
        if (error.message.toLowerCase().includes("email not confirmed")) {
          errorMsg = "Email belum dikonfirmasi. Cek link verifikasi di inbox email Anda.";
        } else if (error.message.toLowerCase().includes("invalid login credentials")) {
          errorMsg = "Email atau password salah. Akun tidak ditemukan.";
        } else {
          errorMsg = error.message;
        }

        return NextResponse.json({ ok: false, error: errorMsg }, { status: 401 });
      }

      if (!data.user) {
        return NextResponse.json(
          { ok: false, error: "Akun tidak ditemukan. Silakan daftar terlebih dahulu." },
          { status: 401 }
        );
      }

      authUser = data.user;
      authName =
        (data.user.user_metadata?.full_name as string) ||
        (data.user.user_metadata?.name as string) ||
        email.split("@")[0];
    }

    // Ekstrak nama pengguna yang rapi
    const finalName =
      authName ||
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
        db.profile.name = finalName;
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
      provider: "supabase",
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
