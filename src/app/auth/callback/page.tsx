"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();

  React.useEffect(() => {
    let handled = false;

    async function handleAuth() {
      try {
        // 1. Cek session dari hash URL atau Supabase state
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const user = data.session?.user;

        if (user) {
          handled = true;
          const meta = user.user_metadata || {};
          const name = meta.full_name || meta.name || user.email?.split("@")[0] || "Trader";
          const email = user.email || "";
          const avatarUrl = meta.avatar_url || meta.picture || "";

          // 2. Simpan profil Google ke database lokal tradelog
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              avatar_url: avatarUrl,
            }),
          });

          const result = await res.json();
          if (result.ok) {
            toast.success(`Selamat datang, ${name}!`, {
              description: `Berhasil terhubung dengan Google (${email})`,
            });
            router.replace("/dashboard");
            return;
          }
        }

        // 3. Jika belum langsung dapat dari getSession, pasang listener onAuthStateChange
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (handled) return;
            if (session?.user) {
              handled = true;
              const meta = session.user.user_metadata || {};
              const name = meta.full_name || meta.name || session.user.email?.split("@")[0] || "Trader";
              const email = session.user.email || "";
              const avatarUrl = meta.avatar_url || meta.picture || "";

              await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name,
                  email,
                  avatar_url: avatarUrl,
                }),
              });

              toast.success(`Selamat datang, ${name}!`, {
                description: `Berhasil terhubung dengan Google (${email})`,
              });
              router.replace("/dashboard");
            }
          }
        );

        // Fallback timeout jika user membatalkan
        setTimeout(() => {
          if (!handled) {
            // Cek sekali lagi
            supabase.auth.getUser().then(({ data: userData }) => {
              if (userData?.user) {
                const meta = userData.user.user_metadata || {};
                const name = meta.full_name || meta.name || userData.user.email?.split("@")[0] || "Trader";
                fetch("/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name,
                    email: userData.user.email,
                    avatar_url: meta.avatar_url || meta.picture,
                  }),
                }).then(() => {
                  router.replace("/dashboard");
                });
              } else {
                toast.error("Otentikasi Google tidak selesai atau dibatalkan.");
                router.replace("/login");
              }
            });
          }
        }, 3000);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Auth callback error:", err);
        toast.error("Gagal memproses login Google.");
        router.replace("/login");
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050507] text-[#f2f2f0]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#b2ff05]" />
        <p className="text-sm font-medium text-[#a1a1aa]">
          Menyambungkan akun Google Anda ke Tradelog...
        </p>
      </div>
    </div>
  );
}
