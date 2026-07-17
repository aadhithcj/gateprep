import { GlassCard } from "./GlassCard";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  accent?: "brand" | "brand2" | "warn" | "ok";
  className?: string;
}

const accentMap = {
  brand: "from-[oklch(0.68_0.19_275)] to-[oklch(0.72_0.16_235)]",
  brand2: "from-[oklch(0.72_0.16_235)] to-[oklch(0.75_0.18_190)]",
  warn: "from-[oklch(0.78_0.17_60)] to-[oklch(0.75_0.20_30)]",
  ok: "from-[oklch(0.78_0.17_150)] to-[oklch(0.72_0.16_180)]",
};

export function StatCard({ label, value, sub, icon: Icon, accent = "brand", className }: Props) {
  return (
    <GlassCard className={cn("relative overflow-hidden", className)}>
      <div className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl bg-linear-to-br", accentMap[accent])} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        {Icon && (
          <div className={cn("rounded-xl p-2.5 bg-linear-to-br text-white/90", accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
