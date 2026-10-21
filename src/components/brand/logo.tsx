import { cn } from "@/lib/utils";

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/logo-icon.png"
        alt="Tradelog Logo"
        className="h-8 w-8 rounded-[7px] object-contain shrink-0"
      />
      {showWordmark && (
        <img
          src="/logo-text.png"
          alt="TRADELOG"
          className="h-4 w-auto object-contain"
        />
      )}
    </span>
  );
}
