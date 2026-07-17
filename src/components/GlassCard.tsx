import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function GlassCard({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={cn("glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
