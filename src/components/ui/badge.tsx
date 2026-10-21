import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        profit: "border-profit/25 bg-profit/10 text-profit",
        loss: "border-loss/25 bg-loss/10 text-loss",
        warning: "border-warning/25 bg-warning/10 text-warning",
        muted: "border-border bg-muted/60 text-muted-foreground",
        purple: "border-violet-500/25 bg-violet-500/10 text-violet-400",
        sky: "border-sky-500/25 bg-sky-500/10 text-sky-400",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
