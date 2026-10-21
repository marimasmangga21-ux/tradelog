"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LogIn, UserPlus, Sparkles } from "lucide-react";
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
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/dashboard";

  const [mode, setMode] = React.useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [notice, setNotice] = React.useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setNotice("");

    try {
      if (mode === "reset") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), mode: "reset" }),
        });
        const data = await res.json();
        if (data.ok) {
          setMessage("Link reset password terkirim ke email jika akun terdaftar.");
          toast.success("Tautan reset password telah dikirim.");
        } else {
          setMessage(data.error || "Gagal memproses reset password.");
        }
        return;
      }

      // Login atau Signup
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Autentikasi gagal. Coba lagi.");
      }

      const userName = data.user?.name || "Trader";
      if (mode === "signup") {
        setMessage("Akun berhasil dibuat. Sedang masuk ke Tradelog...");
        toast.success(`Akun dibuat! Selamat datang, ${userName}`);
      } else {
        setMessage("Berhasil masuk. Mengalihkan ke Tradelog...");
        toast.success(`Selamat datang kembali, ${userName}!`);
      }

      // Pastikan redirect selalu ke Tradelog
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 400);
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
      const userEmail = email.trim() || "marimasmangga21@gmail.com";
      const userName =
        userEmail === "marimasmangga21@gmail.com"
          ? "Evan Mita"
          : userEmail.split("@")[0];

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(`Selamat datang di Tradelog, ${userName}!`);
        window.location.href = redirectTarget;
      } else {
        setMessage(data.error || "Gagal masuk dengan Google.");
        setBusy(false);
      }
    } catch {
      setMessage("Terjadi kesalahan saat masuk dengan Google.");
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* Brand Icon & Name persis style Calculator */}
        <div className="auth-brand-icon">
          <img src="/icon.png" alt="Logo" width="48" height="48" />
        </div>
        <p className="auth-brand-name">TRADELOG · PRECISION JOURNAL</p>

        {/* Title & Description persis style Calculator */}
        <h1>
          {mode === "login"
            ? "Selamat datang kembali"
            : mode === "signup"
            ? "Buat akun pribadi"
            : "Reset password"}
        </h1>

        <p className="auth-description">
          {mode === "reset"
            ? "Masukkan email akun. Kami akan mengirim tautan untuk membuat password baru."
            : "Masuk untuk mencatat jurnal trading, performa analitik, dan riwayat posisi di akun Anda."}
        </p>

        {notice && (
          <div className="auth-notice" role="status">
            {notice}
          </div>
        )}

        {/* Form Auth */}
        <form className="auth-form" onSubmit={handleSubmit}>
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

          {mode !== "reset" && (
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
                  minLength={6}
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
                : "Kirim link reset"}
            </span>
          </button>
        </form>

        {mode !== "reset" && (
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

        {/* Switch mode links persis style Calculator */}
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
              {mode === "reset" ? "Kembali ke masuk" : "Sudah punya akun? Masuk"}
            </button>
          )}
        </div>

        {/* Akses instan Owner */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
          <button
            type="button"
            onClick={() => {
              setEmail("marimasmangga21@gmail.com");
              setPassword("trader123456");
              handleGoogleLogin();
            }}
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
