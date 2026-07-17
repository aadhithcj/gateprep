import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/pyq")({
  component: PYQPage,
  head: () => ({ meta: [{ title: "PYQ Tracker — GatePrep" }] }),
});

function PYQPage() {
  const { data, hydrated, updatePYQ } = useData();
  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="PYQ Tracker" subtitle="Previous year questions solved and accuracy by difficulty." />
      <div className="grid gap-4 md:grid-cols-2">
        {data.subjects.map((s) => {
          const p = data.pyqs.find((x) => x.subjectId === s.id) ?? { subjectId: s.id, solved: 0, remaining: 30, easyAcc: 0, mediumAcc: 0, hardAcc: 0 };
          const total = p.solved + p.remaining;
          const percent = total > 0 ? Math.round((p.solved / total) * 100) : 0;
          return (
            <GlassCard key={s.id}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{s.name}</h3>
                <span className="text-xs text-muted-foreground">{p.solved}/{total} solved</span>
              </div>
              <Progress value={percent} className="h-2" />
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <label className="rounded-lg border border-white/5 bg-white/5 p-2">
                  <span className="text-muted-foreground">Solved</span>
                  <Input type="number" min={0} value={p.solved} onChange={(e) => updatePYQ(s.id, { solved: Math.max(0, Number(e.target.value)) })} className="mt-1 h-8" />
                </label>
                <label className="rounded-lg border border-white/5 bg-white/5 p-2">
                  <span className="text-muted-foreground">Remaining</span>
                  <Input type="number" min={0} value={p.remaining} onChange={(e) => updatePYQ(s.id, { remaining: Math.max(0, Number(e.target.value)) })} className="mt-1 h-8" />
                </label>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {(["easyAcc", "mediumAcc", "hardAcc"] as const).map((key, i) => {
                  const label = ["Easy %", "Medium %", "Hard %"][i];
                  const tone = ["text-emerald-300", "text-amber-300", "text-rose-300"][i];
                  return (
                    <label key={key} className="rounded-lg border border-white/5 bg-white/5 p-2">
                      <span className={"text-[10px] uppercase " + tone}>{label}</span>
                      <Input type="number" min={0} max={100} value={p[key]} onChange={(e) => updatePYQ(s.id, { [key]: Math.max(0, Math.min(100, Number(e.target.value))) })} className="mt-1 h-8" />
                    </label>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
