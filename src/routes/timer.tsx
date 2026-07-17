import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/timer")({
  component: TimerPage,
  head: () => ({ meta: [{ title: "Study Timer — GatePrep" }] }),
});

function TimerPage() {
  const { data, hydrated, updateSettings, incrementPomodoro } = useData();
  const [mode, setMode] = useState<"study" | "break">("study");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hydrated) setRemaining(data.settings.pomodoroStudy * 60);
  }, [hydrated, data.settings.pomodoroStudy]);

  useEffect(() => {
    if (!running) return;
    raf.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (mode === "study") {
            incrementPomodoro();
            toast.success("Session complete! Take a break 🌿");
            setMode("break");
            return data.settings.pomodoroBreak * 60;
          } else {
            toast("Break over. Back to focus 🎯");
            setMode("study");
            return data.settings.pomodoroStudy * 60;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (raf.current) clearInterval(raf.current); };
  }, [running, mode, data.settings.pomodoroStudy, data.settings.pomodoroBreak, incrementPomodoro]);

  const total = (mode === "study" ? data.settings.pomodoroStudy : data.settings.pomodoroBreak) * 60;
  const progress = 1 - remaining / total;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const today = new Date().toISOString().slice(0, 10);
  const todayHours = data.logs.filter((l) => l.date.slice(0, 10) === today).reduce((n, l) => n + l.hours, 0);
  const totalFocus = Math.round((data.pomodoroSessions * data.settings.pomodoroStudy) / 60 * 10) / 10;

  return (
    <div className="space-y-6">
      <PageHeader title="Study Timer" subtitle="Pomodoro focus sessions to keep the momentum." />
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 flex flex-col items-center justify-center py-10">
          <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">{mode === "study" ? "Focus" : "Break"}</div>
          <div className="relative">
            <svg width={280} height={280} className="-rotate-90">
              <circle cx={140} cy={140} r={128} fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth={14} />
              <circle
                cx={140} cy={140} r={128} fill="none"
                stroke={mode === "study" ? "url(#pomo-g1)" : "oklch(0.78 0.17 150)"}
                strokeWidth={14} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 128}
                strokeDashoffset={2 * Math.PI * 128 * (1 - progress)}
                style={{ transition: "stroke-dashoffset 500ms linear" }}
              />
              <defs>
                <linearGradient id="pomo-g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.16 235)" />
                  <stop offset="100%" stopColor="oklch(0.68 0.19 275)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-6xl font-bold tabular-nums">{mm}:{ss}</div>
              <div className="mt-1 text-xs text-muted-foreground">Sessions today · {data.pomodoroSessions}</div>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Button size="lg" onClick={() => setRunning((r) => !r)} className="min-w-32">
              {running ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => { setRunning(false); setRemaining(total); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><TimerIcon className="h-4 w-4" /> Durations</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Study (minutes)</Label>
                <Input type="number" min={1} value={data.settings.pomodoroStudy}
                  onChange={(e) => updateSettings({ pomodoroStudy: Math.max(1, Number(e.target.value)) })} />
              </div>
              <div>
                <Label className="text-xs">Break (minutes)</Label>
                <Input type="number" min={1} value={data.settings.pomodoroBreak}
                  onChange={(e) => updateSettings({ pomodoroBreak: Math.max(1, Number(e.target.value)) })} />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="mb-3 text-sm font-semibold">Stats</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><div className="text-xl font-bold">{totalFocus}h</div><div className="text-[10px] uppercase text-muted-foreground">Focus</div></div>
              <div><div className="text-xl font-bold">{data.pomodoroSessions}</div><div className="text-[10px] uppercase text-muted-foreground">Sessions</div></div>
              <div><div className="text-xl font-bold">{todayHours.toFixed(1)}h</div><div className="text-[10px] uppercase text-muted-foreground">Today</div></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
