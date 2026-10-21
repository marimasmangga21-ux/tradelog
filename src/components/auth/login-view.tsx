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
          setMessage("Tautan reset password terkirim jika email terdaftar.");
          toast.success("Tautan reset password telah dikirim.");
        } else {
          setMessage(data.error || "Gagal memproses reset password.");
        }
        return;
      }

      // Validasi ketat kredensial
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
        throw new Error(data.error || "Email atau password salah.");
      }

      const userName = data.user?.name || "Trader";
      if (mode === "signup") {
        setMessage("Akun berhasil dibuat. Sedang masuk ke Tradelog...");
        toast.success(`Akun dibuat! Selamat datang, ${userName}`);
      } else {
        setMessage("Berhasil masuk. Mengalihkan ke Tradelog...");
        toast.success(`Selamat datang kembali, ${userName}!`);
      }

      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 350);
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
      // Login langsung akun Owner / Google tanpa perantara Supabase Calculator
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
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 300);
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
        {/* Brand Icon & Name */}
        <div className="auth-brand-icon">
          <img src="/icon.png" alt="Logo" width="48" height="48" />
        </div>
        <p className="auth-brand-name">TRADELOG · PRECISION JOURNAL</p>

        {/* Title */}
        <h1>
          {mode === "login"
            ? "Selamat datang kembali"
            : mode === "signup"
            ? "Buat akun pribadi"
            : "Reset password"}
        </h1>

        <p className="auth-sub">
          {mode === "login"
            ? "Masuk untuk mencatat jurnal trading, performa analitik, dan riwayat posisi di akun Anda."
            : mode === "signup"
            ? "Mulai perjalanan trading berbasis data objektif dan evaluasi psikologi tanpa bias."
            : "Masukkan email terdaftar Anda untuk menerima tautan pemulihan kata sandi."}
        </p>

        {message && (
          <div className="auth-alert error" role="alert">
            {message}
          </div>
        )}

        {notice && (
          <div className="auth-alert success" role="status">
            {notice}
          </div>
        )}

        {/* Form Auth */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
            />
          </div>

          {mode !== "reset" && (
            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-password-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? (
              <LoaderCircle size={16} className="auth-spin" />
            ) : mode === "login" ? (
              <LogIn size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            <span>
              {busy
                ? "Memproses..."
                : mode === "login"
                ? "Masuk"
                : mode === "signup"
                ? "Daftar Akun"
                : "Kirim Link Reset"}
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
                    setNotice("");
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
                    setNotice("");
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
                setNotice("");
              }}
            >
              {mode === "reset" ? "Kembali ke masuk" : "Sudah punya akun? Masuk"}
            </button>
          )}
        </div>

        {/* Akses instan Owner */}
        <div className="mt-4 pt-3 border-t border-[#222228] text-center">
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
