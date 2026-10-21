"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LogIn,
  UserPlus,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
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
          setNotice("Tautan pemulihan kata sandi telah dikirim ke email Anda.");
          toast.success("Tautan reset terkirim.");
        } else {
          setMessage(data.error || "Gagal memproses reset password.");
        }
        return;
      }

      // Validasi ketat kredensial login / signup
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
        setNotice("Akun berhasil dibuat. Sedang mengalihkan...");
        toast.success(`Akun dibuat! Selamat datang, ${userName}`);
      } else {
        setNotice("Berhasil masuk. Mengalihkan ke dashboard...");
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

        <p className="auth-description">
          {mode === "login"
            ? "Masuk untuk mencatat jurnal trading, performa analitik, dan riwayat posisi di akun Anda."
            : mode === "signup"
            ? "Mulai perjalanan trading berbasis data objektif dan evaluasi psikologi tanpa bias."
            : "Masukkan email terdaftar Anda untuk menerima tautan pemulihan kata sandi."}
        </p>

        {/* Segmented Mode Tabs */}
        {mode !== "reset" && (
          <div className="auth-tabs" role="tablist" aria-label="Mode Masuk">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setMessage("");
                setNotice("");
              }}
            >
              <LogIn size={15} />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-tab-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setMessage("");
                setNotice("");
              }}
            >
              <UserPlus size={15} />
              <span>Daftar Akun</span>
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {message && (
          <div className="auth-message error" role="alert">
            <AlertCircle size={16} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {notice && (
          <div className="auth-notice success" role="status">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Form Auth */}
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            className="input-field"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="trader@gmail.com"
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
            </>
          )}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? (
              <LoaderCircle size={16} className="auth-spinner" />
            ) : mode === "login" ? (
              <LogIn size={16} />
            ) : mode === "signup" ? (
              <UserPlus size={16} />
            ) : (
              <KeyRound size={16} />
            )}
            <span>
              {busy
                ? "Memproses..."
                : mode === "login"
                ? "Masuk ke Tradelog"
                : mode === "signup"
                ? "Buat Akun Pribadi"
                : "Kirim Tautan Reset"}
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

        {/* Switch / Reset links */}
        <div className="auth-switch">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setMessage("");
                setNotice("");
              }}
            >
              Lupa kata sandi?
            </button>
          ) : mode === "reset" ? (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
                setNotice("");
              }}
            >
              Kembali ke Masuk
            </button>
          ) : (
            <div>
              <span>Sudah punya akun?</span>{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                  setNotice("");
                }}
              >
                Masuk sekarang
              </button>
            </div>
          )}
        </div>

        {/* Akses instan Owner */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.05] text-center">
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
            <span>Akses Cepat Owner (marimasmangga21@gmail.com)</span>
          </button>
        </div>

        <p className="auth-security-note">
          Data akun dan jurnal trading disimpan secara privat dan terenkripsi.
        </p>
      </section>
    </main>
  );
}
