import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData, totalHours, currentStreak } from "@/lib/storage";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
  head: () => ({ meta: [{ title: "Achievements — GatePrep" }] }),
});

function AchievementsPage() {
  const { data, hydrated } = useData();
  if (!hydrated) return null;

  const hours = totalHours(data);
  const streak = currentStreak(data);
  const mocks = data.mocks.length;
  const osDone = data.subjects.find((s) => s.id === "os")?.topics.every((t) => t.status === "completed") ?? false;
  const dbmsDone = data.subjects.find((s) => s.id === "dbms")?.topics.every((t) => t.status === "completed") ?? false;

  const achievements = [
    { id: "10h", name: "First 10 Hours", desc: "Log 10 total study hours.", unlocked: hours >= 10 },
    { id: "100h", name: "Century Club", desc: "Log 100 total study hours.", unlocked: hours >= 100 },
    { id: "500h", name: "Grinder", desc: "Log 500 total study hours.", unlocked: hours >= 500 },
    { id: "7d", name: "7-Day Streak", desc: "Study 7 days in a row.", unlocked: streak >= 7 },
    { id: "30d", name: "30-Day Streak", desc: "Study 30 days in a row.", unlocked: streak >= 30 },
    { id: "mock1", name: "First Mock", desc: "Complete your first mock test.", unlocked: mocks >= 1 },
    { id: "mock10", name: "Mock Warrior", desc: "Complete 10 mock tests.", unlocked: mocks >= 10 },
    { id: "os", name: "Finished OS", desc: "Complete every OS topic.", unlocked: osDone },
    { id: "dbms", name: "Finished DBMS", desc: "Complete every DBMS topic.", unlocked: dbmsDone },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" subtitle={`${achievements.filter((a) => a.unlocked).length} of ${achievements.length} unlocked.`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <GlassCard key={a.id} className={cn("relative overflow-hidden transition-all", a.unlocked ? "" : "opacity-60")}>
            {a.unlocked && <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-brand opacity-30 blur-2xl" />}
            <div className="flex items-start gap-3">
              <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", a.unlocked ? "bg-gradient-brand text-white" : "bg-white/5 text-muted-foreground")}>
                {a.unlocked ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-primary">{a.unlocked ? "Unlocked" : "Locked"}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
