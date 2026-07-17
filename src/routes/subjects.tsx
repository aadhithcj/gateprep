import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData, subjectCompletion, subjectStatus } from "@/lib/storage";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Confetti } from "@/components/Confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/subjects")({
  component: SubjectsPage,
  head: () => ({ meta: [{ title: "Subjects — GatePrep" }] }),
});

function SubjectsPage() {
  const { data, hydrated, toggleTopic } = useData();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [confettiKey, setConfettiKey] = useState(0);

  const statusColor: Record<string, string> = {
    "Not Started": "bg-muted text-muted-foreground",
    Learning: "bg-blue-500/20 text-blue-300",
    Practicing: "bg-purple-500/20 text-purple-300",
    Revising: "bg-amber-500/20 text-amber-300",
    Completed: "bg-emerald-500/20 text-emerald-300",
  };

  const totals = useMemo(() => {
    if (!hydrated) return null;
    return {
      subjects: data.subjects.length,
      completed: data.subjects.filter((s) => subjectCompletion(s) === 100).length,
    };
  }, [data, hydrated]);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <Confetti trigger={confettiKey} />
      <PageHeader
        title="Subjects"
        subtitle={`${totals?.completed ?? 0} of ${totals?.subjects ?? 0} subjects completed — expand to check off topics.`}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {data.subjects.map((s) => {
          const completion = subjectCompletion(s);
          const status = subjectStatus(s);
          const isOpen = !!open[s.id];
          return (
            <GlassCard key={s.id} className="p-0">
              <button
                onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{s.name}</h3>
                    <Badge className={cn("border-0", statusColor[status])} variant="secondary">{status}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={completion} className="h-2 flex-1" />
                    <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">{completion}%</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{s.topics.filter((t) => t.status === "completed").length}/{s.topics.length} topics</span>
                    <span>{s.hours.toFixed(1)}h studied</span>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="border-t border-white/5 p-4">
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {s.topics.map((t) => {
                      const done = t.status === "completed";
                      return (
                        <li key={t.id}>
                          <button
                            onClick={() => {
                              const wasNotComplete = !done;
                              toggleTopic(s.id, t.id);
                              if (wasNotComplete) {
                                const allDone = s.topics.filter((tp) => tp.id !== t.id).every((tp) => tp.status === "completed");
                                if (allDone) {
                                  setConfettiKey((k) => k + 1);
                                  toast.success(`🎉 ${s.name} completed!`);
                                } else {
                                  toast.success(`Topic marked complete — revisions scheduled.`);
                                }
                              }
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg border border-transparent p-2 text-left text-sm transition-colors hover:border-white/10 hover:bg-white/5",
                              done && "text-muted-foreground line-through"
                            )}
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate">{t.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
