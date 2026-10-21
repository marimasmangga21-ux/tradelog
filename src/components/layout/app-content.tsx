"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const isPreview = pathname === "/preview";

  return (
    <div
      className={cn(
        "transition-[padding] duration-200",
        collapsed ? "lg:pl-[72px]" : "lg:pl-[240px]",
      )}
    >
      <Topbar />
      <main
        className={cn(
          isPreview
            ? "w-full h-[calc(100vh-48px)] p-0 m-0 overflow-hidden"
            : "mx-auto w-full max-w-[1280px] px-3 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
