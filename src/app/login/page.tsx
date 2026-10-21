import * as React from "react";
import type { Metadata } from "next";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Masuk - Tradelog",
  description: "Masuk ke jurnal trading Tradelog dengan Google.",
};

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#050507]" />}>
      <LoginView />
    </React.Suspense>
  );
}
