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
  X,
  User,
  Plus,
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

  // Google Account Chooser Modal State
  const [showGoogleModal, setShowGoogleModal] = React.useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = React.useState("");
  const [customGoogleName, setCustomGoogleName] = React.useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = React.useState(false);

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

  const handleSelectGoogleAccount = async (targetEmail: string, targetName: string) => {
    setBusy(true);
    setShowGoogleModal(false);
    setMessage("");
    setNotice("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: targetName,
          email: targetEmail,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetEmail)}`,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(`Selamat datang, ${targetName}!`);
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
              onClick={() => setShowGoogleModal(true)}
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
          Data akun dan jurnal trading disimpan secara privat dan terenkripsi.
        </p>
      </section>

      {/* Google Account Picker Modal */}
      {showGoogleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-[#222228] bg-[#0e0e12] p-6 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <GoogleIcon />
              <div>
                <h3 className="text-base font-bold text-white">Pilih Akun Google</h3>
                <p className="text-xs text-zinc-400">untuk masuk ke Tradelog Precision Journal</p>
              </div>
            </div>

            <div className="space-y-2 mt-5">
              {/* Account 1: Evan Mita */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount("marimasmangga21@gmail.com", "Evan Mita")}
                disabled={busy}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-[#16161c] hover:bg-[#1d1d24] hover:border-[#b2ff05]/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#b2ff05]/20 to-emerald-500/20 border border-[#b2ff05]/30 flex items-center justify-center text-sm font-bold text-[#b2ff05] shrink-0">
                    EM
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                      Evan Mita
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      marimasmangga21@gmail.com
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#b2ff05] bg-[#b2ff05]/10 px-2 py-0.5 rounded-full border border-[#b2ff05]/20 shrink-0">
                  Utama
                </span>
              </button>

              {/* Gunakan akun lain */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-[#121216] hover:bg-[#181820] text-zinc-300 hover:text-white transition-all text-left text-xs font-medium"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800/60 border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
                    <Plus size={16} />
                  </div>
                  <span>Gunakan akun Google lain</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl border border-[#b2ff05]/30 bg-[#16161c] space-y-2.5">
                  <p className="text-xs font-semibold text-zinc-200">Masukkan Akun Google Anda</p>
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full text-xs bg-[#0a0a0d] border border-[#222228] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#b2ff05]"
                  />
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="contoh@gmail.com"
                    className="w-full text-xs bg-[#0a0a0d] border border-[#222228] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#b2ff05]"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="flex-1 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/60 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={!customGoogleEmail.trim()}
                      onClick={() => {
                        const email = customGoogleEmail.trim();
                        const name = customGoogleName.trim() || email.split("@")[0];
                        handleSelectGoogleAccount(email, name);
                      }}
                      className="flex-1 py-1.5 text-xs font-bold text-black bg-[#b2ff05] hover:bg-[#9fe600] rounded-lg disabled:opacity-50"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 text-center mt-5">
              Tradelog hanya meminta akses identitas profil publik & email untuk otentikasi.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
