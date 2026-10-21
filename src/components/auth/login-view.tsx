"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, CheckCircle2, ChevronRight, KeyRound, Loader2, ShieldCheck, Sparkles, User, Zap } from "lucide-react";
import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "960568853150-ii7c2r206m475eeraihh76g08qcdc23k.apps.googleusercontent.com";

const DEMO_GOOGLE_ACCOUNTS = [
  {
    name: "Evan Mita",
    email: "marimasmangga21@gmail.com",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan",
  },
  {
    name: "Trader Pro",
    email: "trader.mita@gmail.com",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  },
];

// Helper parse JWT token dari Google Identity Services
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [customName, setCustomName] = React.useState("");
  const [customEmail, setCustomEmail] = React.useState("");
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  const executeGoogleLogin = async (account: {
    name: string;
    email: string;
    avatar_url: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(`Selamat datang, ${account.name}!`, {
          description: `Berhasil login dengan ${account.email}`,
        });
        setModalOpen(false);
        const redirect = searchParams?.get("redirect") || "/dashboard";
        window.location.href = redirect;
      } else {
        toast.error("Login gagal", { description: data.error });
        setLoading(false);
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  const handleCredentialResponse = (response: any) => {
    if (!response.credential) {
      toast.error("Otentikasi Google tidak menerima kredensial.");
      return;
    }
    const payload = decodeJwt(response.credential);
    if (!payload || !payload.email) {
      toast.error("Kredensial token Google tidak valid.");
      return;
    }

    executeGoogleLogin({
      name: payload.name || payload.given_name || payload.email.split("@")[0],
      email: payload.email,
      avatar_url: payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.email}`,
    });
  };

  const [googleBlocked, setGoogleBlocked] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        // Fallback langsung ke backend route
        window.location.href = "/api/auth/google";
      }
    } catch {
      window.location.href = "/api/auth/google";
    }
  };

  const initGoogleSdk = () => {
    try {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            text: "continue_with",
            locale: "id",
            width: 340,
          });
        }
      }
    } catch {
      setGoogleBlocked(true);
    }
  };

  React.useEffect(() => {
    initGoogleSdk();
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleSdk}
      />

      <div className="relative min-h-screen w-full overflow-hidden bg-[#050507] text-[#f2f2f0] flex flex-col justify-between selection:bg-[#b2ff05]/20 selection:text-[#b2ff05]">
        {/* Subtle Ambient Background */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[640px] rounded-full bg-[#b2ff05]/[0.04] blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[380px] w-[500px] rounded-full bg-[#18181b]/50 blur-[140px]" />

        {/* Minimal Nav Header */}
        <header className="relative z-10 flex h-16 w-full items-center justify-between px-6 sm:px-12 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="Tradelog"
              className="h-8 w-8 rounded-lg object-contain shadow-[0_0_15px_rgba(178,255,5,0.3)]"
            />
            <img
              src="/logo-text.png"
              alt="TRADELOG"
              className="h-4 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#71717a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b2ff05] animate-pulse" />
            <span>MT5 Engine Active</span>
          </div>
        </header>

        {/* Center Auth Card */}
        <main className="relative z-10 mx-auto w-full max-w-[420px] my-auto py-8 px-4">
          <div className="tradoxes-card relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
            {/* Top highlight bar */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#b2ff05] to-transparent" />

            {/* Title & Description */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#141418] border border-white/[0.08] shadow-inner mb-4">
                <KeyRound className="h-5 w-5 text-[#b2ff05]" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#f4f4f5]">
                Masuk ke Tradelog
              </h1>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                Jurnal trading institusional dengan auto-sync multi-akun MT5 & pemisahan saldo deposit vs profit.
              </p>
            </div>

            {/* Google Sign In Options */}
            <div className="mt-7 space-y-3.5">
              {/* Quick 1-Click Profile Login */}
              <button
                type="button"
                onClick={() => executeGoogleLogin(DEMO_GOOGLE_ACCOUNTS[0])}
                disabled={loading}
                className={cn(
                  "group relative flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#121215] p-3.5 transition-all duration-200 hover:border-[#b2ff05]/60 hover:bg-[#18181e] active:scale-[0.98] shadow-lg",
                  loading && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={DEMO_GOOGLE_ACCOUNTS[0].avatar_url}
                      alt={DEMO_GOOGLE_ACCOUNTS[0].name}
                      className="h-11 w-11 rounded-full border border-white/15 bg-[#27272a] object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#b2ff05] text-black">
                      <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white">{DEMO_GOOGLE_ACCOUNTS[0].name}</p>
                      <span className="rounded bg-[#b2ff05] px-1.5 py-0.5 text-[9px] font-black text-black shadow-[0_0_8px_rgba(178,255,5,0.4)]">
                        Owner
                      </span>
                    </div>
                    <p className="text-xs text-[#8e8e93] font-mono mt-0.5">{DEMO_GOOGLE_ACCOUNTS[0].email}</p>
                  </div>
                </div>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#b2ff05]" />
                ) : (
                  <div className="flex items-center gap-1 rounded-xl bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-[#b2ff05] group-hover:bg-[#b2ff05] group-hover:text-black transition-all">
                    <span>Masuk</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/[0.08]" />
                <span className="flex-shrink mx-3 text-[10px] text-[#71717a] uppercase tracking-wider font-semibold">
                  Atau Masuk dengan Email Lain
                </span>
                <div className="flex-grow border-t border-white/[0.08]" />
              </div>

              {/* Direct Email Input on Card */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customEmail) {
                    toast.error("Email wajib diisi");
                    return;
                  }
                  executeGoogleLogin({
                    name: customName || customEmail.split("@")[0],
                    email: customEmail,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customEmail}`,
                  });
                }}
                className="space-y-2.5"
              >
                <div>
                  <Input
                    type="email"
                    placeholder="email.anda@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="h-10 bg-[#121215] border-white/10 text-xs rounded-xl focus:border-[#b2ff05]/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !customEmail}
                  className="w-full h-10 bg-[#b2ff05] text-black hover:bg-[#9fe000] font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(178,255,5,0.25)] transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <span>Masuk Sekarang</span>
                  )}
                </Button>
              </form>

              {/* Real Google OAuth Redirect Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0c0c0e] px-3 py-2 text-xs text-[#a1a1aa] hover:border-white/20 hover:text-white transition-all"
                >
                  <GoogleIcon className="h-3.5 w-3.5" />
                  <span>Google OAuth (Browser Login)</span>
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-6">
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 border border-white/[0.04]">
                <ShieldCheck className="h-4 w-4 text-[#b2ff05] shrink-0" />
                <span className="text-[11px] font-medium text-[#a1a1aa]">Data Lokal Aman</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 border border-white/[0.04]">
                <Sparkles className="h-4 w-4 text-[#b2ff05] shrink-0" />
                <span className="text-[11px] font-medium text-[#a1a1aa]">Auto-Sync MT5</span>
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="relative z-10 flex h-14 w-full items-center justify-between px-6 sm:px-12 text-[11px] text-[#71717a] border-t border-white/[0.04]">
          <span>© 2026 Tradelog Enterprise</span>
          <div className="flex gap-4">
            <Link href="/preview" className="hover:text-[#b2ff05] transition-colors">
              Studio iPhone 17
            </Link>
          </div>
        </footer>

        {/* Fallback Selection Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md border-white/10 bg-[#0e0e12] p-6 text-[#f4f4f5]">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <GoogleIcon className="h-4 w-4" />
                <span>Pilih Akun Google</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8e8e93]">
                Pilih profil Anda untuk langsung masuk ke sesi Tradelog.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              {DEMO_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => executeGoogleLogin(acc)}
                  disabled={loading}
                  className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-[#141418] p-3 text-left transition hover:border-[#b2ff05]/40 hover:bg-[#1a1a20]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar_url}
                      alt={acc.name}
                      className="h-9 w-9 rounded-full border border-white/10 bg-[#27272a]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{acc.name}</p>
                      <p className="text-[11px] text-[#8e8e93]">{acc.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#71717a]" />
                </button>
              ))}

              <div className="pt-3">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/[0.08]" />
                  <span className="flex-shrink mx-3 text-[10px] text-[#71717a] uppercase tracking-wider">
                    Atau Akun Google Anda
                  </span>
                  <div className="flex-grow border-t border-white/[0.08]" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="custom-name" className="text-xs text-[#a1a1aa]">Nama Tampilan</Label>
                    <Input
                      id="custom-name"
                      placeholder="cth. Evan Mellvino"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="h-9 bg-[#141418] border-white/10 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="custom-email" className="text-xs text-[#a1a1aa]">Email Google</Label>
                    <Input
                      id="custom-email"
                      type="email"
                      placeholder="email@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="h-9 bg-[#141418] border-white/10 text-xs"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!customEmail) {
                        toast.error("Email wajib diisi");
                        return;
                      }
                      executeGoogleLogin({
                        name: customName || customEmail.split("@")[0],
                        email: customEmail,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customEmail}`,
                      });
                    }}
                    disabled={loading || !customEmail}
                    className="w-full h-9 bg-[#b2ff05] text-black hover:bg-[#9fe000] text-xs font-semibold mt-2"
                  >
                    Masuk Sekarang
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
