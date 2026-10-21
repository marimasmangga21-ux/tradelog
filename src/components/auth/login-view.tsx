"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LogIn, UserPlus, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/dashboard";

  const [mode, setMode] = React.useState<"login" | "signup" | "reset" | "recovery">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [notice, setNotice] = React.useState("");

  // Sync session payload ke backend HTTP cookie
  const syncSessionToBackend = async (user: any) => {
    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email?.split("@")[0] || "Trader";
    const userEmail = user.email || "";
    const avatarUrl =
      meta.avatar_url ||
      meta.picture ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`;

    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: userEmail,
        avatar_url: avatarUrl,
      }),
    });

    return res.ok;
  };

  // Listen auth state & detect password recovery
  React.useEffect(() => {
    let alive = true;

    // Check URL hash for recovery token
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
        setMode("recovery");
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!alive) return;
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
      }
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setNotice("");

    try {
      if (mode === "recovery") {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast.success("Password berhasil diperbarui!");
        const { data: sessData } = await supabase.auth.getSession();
        if (sessData?.session?.user) {
          await syncSessionToBackend(sessData.session.user);
        }
        window.location.href = redirectTarget;
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.session?.user) {
          await syncSessionToBackend(data.session.user);
          setMessage("Akun berhasil dibuat. Sedang masuk...");
          toast.success("Akun berhasil dibuat!");
          window.location.href = redirectTarget;
        } else {
          setMessage("Akun dibuat. Cek email untuk verifikasi, lalu masuk.");
          toast.info("Cek email Anda untuk konfirmasi pendaftaran.");
        }
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setMessage("Link reset password terkirim ke email jika akun terdaftar.");
        toast.success("Tautan reset password telah dikirim.");
      } else {
        // Mode login standard
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // Jika akun belum dibuat atau credential beda, throw error
          throw error;
        }

        if (data.session?.user) {
          await syncSessionToBackend(data.session.user);
          toast.success(`Selamat datang kembali!`);
          window.location.href = redirectTarget;
        }
      }
    } catch (error: any) {
      setMessage(error.message || "Autentikasi gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setBusy(true);
    setMessage("");
    setNotice("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Redirect ke Google akan berjalan otomatis
    } catch (error: any) {
      setMessage(error.message || "Gagal masuk dengan Google. Coba lagi.");
      setBusy(false);
    }
  };

  // 1-Click login darurat/owner jika ingin akses instan
  const handleQuickOwnerLogin = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Evan Mita",
          email: "marimasmangga21@gmail.com",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Login cepat berhasil sebagai Owner!");
        window.location.href = redirectTarget;
      } else {
        setMessage(data.error || "Gagal masuk");
        setBusy(false);
      }
    } catch {
      setMessage("Terjadi kesalahan jaringan.");
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* Brand Icon & Name */}
        <div className="auth-brand-icon">
          <img src="/icon.png" alt="Logo" width="48" height="48" />
        </div>
        <p className="auth-brand-name">TRADELOG · PRECISION JOURNAL</p>

        {/* Title & Description */}
        <h1>
          {mode === "login"
            ? "Selamat datang kembali"
            : mode === "signup"
            ? "Buat akun pribadi"
            : mode === "recovery"
            ? "Buat password baru"
            : "Reset password"}
        </h1>

        <p className="auth-description">
          {mode === "reset"
            ? "Masukkan email akun. Kami akan mengirim tautan untuk membuat password baru."
            : mode === "recovery"
            ? "Masukkan password baru untuk mengamankan akun Anda."
            : "Masuk untuk mencatat jurnal trading, performa analitik, dan riwayat posisi di akun Anda."}
        </p>

        {notice && (
          <div className="auth-notice" role="status">
            {notice}
          </div>
        )}

        {/* Form Auth */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode !== "recovery" && (
            <>
              <label className="auth-label" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                className="input-field"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
              />
            </>
          )}

          {mode === "recovery" ? (
            <>
              <label className="auth-label" htmlFor="recovery-password">
                Password baru
              </label>
              <div className="auth-password-wrap">
                <input
                  id="recovery-password"
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </>
          ) : (
            mode !== "reset" && (
              <>
                <label className="auth-label" htmlFor="auth-password">
                  Password
                </label>
                <div className="auth-password-wrap">
                  <input
                    id="auth-password"
                    className="input-field"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </>
            )
          )}

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          <button className="auth-submit w-full" type="submit" disabled={busy}>
            {busy ? (
              <LoaderCircle size={17} className="auth-spinner" />
            ) : mode === "login" ? (
              <LogIn size={17} />
            ) : (
              <UserPlus size={17} />
            )}
            <span>
              {busy
                ? "Memproses..."
                : mode === "login"
                ? "Masuk"
                : mode === "signup"
                ? "Daftar"
                : mode === "recovery"
                ? "Simpan password baru"
                : "Kirim link reset"}
            </span>
          </button>
        </form>

        {mode !== "reset" && mode !== "recovery" && (
          <>
            <div className="auth-divider" role="separator" aria-hidden="true">
              <span>atau</span>
            </div>
            <button
              type="button"
              className="auth-google"
              onClick={handleGoogleLogin}
              disabled={busy}
            >
              <GoogleIcon />
              <span>Lanjutkan dengan Google</span>
            </button>
          </>
        )}

        {/* Switch mode links */}
        <div className="auth-switch">
          {mode === "login" ? (
            <>
              <div>
                <span>Belum punya akun?</span>{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                  }}
                >
                  Daftar
                </button>
              </div>
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setMessage("");
                  }}
                >
                  Lupa password?
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              {mode === "reset" || mode === "recovery"
                ? "Kembali ke masuk"
                : "Sudah punya akun? Masuk"}
            </button>
          )}
        </div>

        {/* Quick Owner 1-click fallback */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
          <button
            type="button"
            onClick={handleQuickOwnerLogin}
            disabled={busy}
            className="text-[11px] text-[#71717a] hover:text-[#b2ff05] transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3 w-3 text-[#b2ff05]" />
            <span>Masuk instan akun Owner (marimasmangga21@gmail.com)</span>
          </button>
        </div>

        <p className="auth-security-note">
          Data akun dan analisis disimpan secara privat. Gunakan password yang unik.
        </p>
      </section>
    </main>
  );
}
