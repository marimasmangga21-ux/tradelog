import { NextResponse } from "next/server";
import { mutateDb, readDb, nowIso } from "@/lib/store/db";

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

    const db = await readDb();

    // 1. Mode Reset Password
    if (body.mode === "reset") {
      const userExists = db.users?.some((u) => u.email.toLowerCase() === email);
      if (!userExists) {
        return NextResponse.json(
          { ok: false, error: "Email tidak terdaftar dalam sistem." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        ok: true,
        message: "Tautan pemulihan kata sandi telah dikirim ke email Anda.",
      });
    }

    // Validasi panjang password
    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // 2. Mode Signup (Pendaftaran Akun Baru)
    if (body.mode === "signup") {
      const existingUser = db.users?.find((u) => u.email.toLowerCase() === email);
      if (existingUser) {
        return NextResponse.json(
          { ok: false, error: "Email ini sudah terdaftar. Silakan pilih tab Masuk." },
          { status: 400 }
        );
      }

      const newUserName =
        body.name ||
        email
          .split("@")[0]
          .split(/[._-]/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ") ||
        "Trader";

      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

      const updatedProfile = await mutateDb(
        (draft) => {
          if (!Array.isArray(draft.users)) {
            draft.users = [];
          }
          draft.users.push({
            id: `usr_${Date.now()}`,
            email,
            password: body.password!,
            name: newUserName,
            avatar_url: avatarUrl,
            created_at: nowIso(),
          });

          draft.profile.name = newUserName;
          draft.profile.email = email;
          draft.profile.avatar_url = avatarUrl;
          draft.profile.updated_at = nowIso();
          return { ...draft.profile };
        },
        { keepSample: true, targetEmail: email }
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
    }

    // 3. Mode Login: Validasi ketat terhadap email dan password
    const user = db.users?.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Akun belum terdaftar. Silakan daftar terlebih dahulu di tab Daftar.",
        },
        { status: 401 }
      );
    }

    if (user.password !== body.password) {
      return NextResponse.json(
        { ok: false, error: "Password salah. Pastikan password Anda benar." },
        { status: 401 }
      );
    }

    // Password cocok -> Login berhasil
    const updatedProfile = await mutateDb(
      (draft) => {
        draft.profile.name = user.name || draft.profile.name || "Trader";
        draft.profile.email = user.email;
        draft.profile.avatar_url =
          user.avatar_url ||
          draft.profile.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
        draft.profile.updated_at = nowIso();
        return { ...draft.profile };
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
