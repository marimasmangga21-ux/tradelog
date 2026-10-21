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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "1007560172153-vtvs7npak2q6uk4puoll1ij9bt3r68k6.apps.googleusercontent.com";

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

  // Load Google Identity Services SDK di client
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("google-gsi-client")) return;

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

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

      // Validasi kredensial login / signup
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

  const syncGoogleUserToTradelog = async (profile: { name?: string; email: string; picture?: string }) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email,
        avatar_url: profile.picture || "",
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Gagal menyimpan sesi akun Google.");
    }

    setNotice(`Selamat datang, ${data.user?.name || profile.email}!`);
    toast.success(`Berhasil masuk sebagai ${data.user?.name || profile.email}`);
    setTimeout(() => {
      window.location.href = redirectTarget;
    }, 300);
  };

  const handleGoogleLogin = async () => {
    setBusy(true);
    setMessage("");
    setNotice("");

    // 1. Coba gunakan Google Identity Services Token Client (langsung muncul dialog Pilih Akun resmi Google)
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setBusy(false);
              if (tokenResponse.error !== "popup_closed_by_user") {
                setMessage("Gagal menghubungkan akun Google. Silakan coba lagi.");
              }
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userProfile = await userInfoRes.json();
                if (userProfile?.email) {
                  await syncGoogleUserToTradelog(userProfile);
                  return;
                }
                throw new Error("Email Google tidak ditemukan.");
              } catch (err: any) {
                setMessage(err.message || "Gagal memproses data akun Google.");
                setBusy(false);
              }
            }
          },
        });

        // Paksa prompt select_account agar SELALU muncul popup pilih akun
        client.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.warn("Google GIS error, fallback ke Supabase OAuth:", err);
      }
    }

    // 2. Fallback jika GIS belum siap: Supabase OAuth
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://tradelogjournal-app.vercel.app";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setMessage(err?.message || "Gagal membuka autentikasi Google.");
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

        <p className="auth-security-note">
          Data akun dan jurnal trading disimpan secara privat dan terenkripsi per akun.
        </p>
      </section>
    </main>
  );
}
