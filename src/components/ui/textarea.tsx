import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[90px] w-full rounded-lg border border-[#27272a] bg-[#121214] px-3 py-2 text-sm text-[#f4f4f5] shadow-sm transition-colors",
        "placeholder:text-zinc-500",
        "focus-visible:border-[#b2ff05]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b2ff05]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
