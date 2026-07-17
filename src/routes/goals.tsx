import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trash2, Plus, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/goals")({
  component: GoalsPage,
  head: () => ({ meta: [{ title: "Goals — GatePrep" }] }),
});

function GoalsPage() {
  const { data, hydrated, addGoal, updateGoal, deleteGoal, updateSettings } = useData();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(20);
  const [type, setType] = useState<"weekly" | "monthly">("weekly");

  if (!hydrated) return null;

  const weekly = data.goals.filter((g) => g.type === "weekly");
  const monthly = data.goals.filter((g) => g.type === "monthly");

  return (
    <div className="space-y-6">
      <PageHeader title="Goals" subtitle="Set clear targets — daily, weekly, and monthly." />

      <GlassCard>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4" /> Long-term targets</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label className="text-xs">Target Rank</Label>
            <Input type="number" value={data.settings.targetRank} onChange={(e) => updateSettings({ targetRank: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Target Score (/100)</Label>
            <Input type="number" value={data.settings.targetScore} onChange={(e) => updateSettings({ targetScore: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Daily Study Hours</Label>
            <Input type="number" step={0.5} value={data.settings.dailyHourTarget} onChange={(e) => updateSettings({ dailyHourTarget: Number(e.target.value) })} />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <form
          onSubmit={(e) => { e.preventDefault(); if (!title) return; addGoal({ type, title, target, progress: 0 }); setTitle(""); }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-40"><Label className="text-xs">Goal</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finish OS scheduling" /></div>
          <div className="w-32"><Label className="text-xs">Target</Label><Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} /></div>
          <div className="w-36"><Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={(v: "weekly" | "monthly") => setType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Add</Button>
        </form>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { title: "Weekly Goals", list: weekly },
          { title: "Monthly Goals", list: monthly },
        ].map((sec) => (
          <GlassCard key={sec.title}>
            <h3 className="mb-3 text-sm font-semibold">{sec.title}</h3>
            {sec.list.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals yet.</p>
            ) : (
              <ul className="space-y-3">
                {sec.list.map((g) => {
                  const pct = g.target > 0 ? Math.min(100, Math.round((g.progress / g.target) * 100)) : 0;
                  return (
                    <li key={g.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{g.title}</span>
                        <Button size="icon" variant="ghost" onClick={() => deleteGoal(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground tabular-nums">{g.progress}/{g.target}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => updateGoal(g.id, { progress: Math.max(0, g.progress - 1) })}>-1</Button>
                        <Button size="sm" variant="secondary" onClick={() => updateGoal(g.id, { progress: g.progress + 1 })}>+1</Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
