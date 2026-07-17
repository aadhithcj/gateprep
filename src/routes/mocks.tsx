import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Trophy, TrendingUp, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/mocks")({
  component: MocksPage,
  head: () => ({ meta: [{ title: "Mock Tests — GatePrep" }] }),
});

function MocksPage() {
  const { data, hydrated, addMock, deleteMock } = useData();
  const [form, setForm] = useState({
    name: "", date: new Date().toISOString().slice(0, 10),
    score: 50, maxMarks: 100, accuracy: 60, timeTaken: 180, weak: "", mistakes: "",
  });

  if (!hydrated) return null;

  const mocks = [...data.mocks].sort((a, b) => a.date.localeCompare(b.date));
  const avg = mocks.length ? Math.round(mocks.reduce((n, m) => n + m.score, 0) / mocks.length) : 0;
  const high = mocks.reduce((n, m) => Math.max(n, m.score), 0);
  const chart = mocks.map((m) => ({ name: m.name.slice(0, 12) || m.date.slice(5), score: m.score, date: m.date }));

  return (
    <div className="space-y-6">
      <PageHeader title="Mock Tests" subtitle="Track score, accuracy and weaknesses over time." />

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard><div className="flex items-center gap-3"><Trophy className="h-6 w-6 text-amber-400" /><div><div className="text-2xl font-bold">{high}</div><div className="text-xs uppercase text-muted-foreground">Highest</div></div></div></GlassCard>
        <GlassCard><div className="flex items-center gap-3"><TrendingUp className="h-6 w-6 text-primary" /><div><div className="text-2xl font-bold">{avg}</div><div className="text-xs uppercase text-muted-foreground">Average</div></div></div></GlassCard>
        <GlassCard><div className="flex items-center gap-3"><Target className="h-6 w-6 text-emerald-400" /><div><div className="text-2xl font-bold">{data.mocks.length}</div><div className="text-xs uppercase text-muted-foreground">Attempts</div></div></div></GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold">Log a mock</h3>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name) return;
              addMock({
                name: form.name, date: form.date, score: form.score, maxMarks: form.maxMarks,
                accuracy: form.accuracy, timeTaken: form.timeTaken,
                weakSubjects: form.weak.split(",").map((s) => s.trim()).filter(Boolean),
                mistakes: form.mistakes,
              });
              toast.success("Mock recorded");
              setForm({ ...form, name: "", mistakes: "", weak: "" });
            }}
          >
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Test Series 3" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label className="text-xs">Score</Label><Input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Out of</Label><Input type="number" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Accuracy %</Label><Input type="number" value={form.accuracy} onChange={(e) => setForm({ ...form, accuracy: Number(e.target.value) })} /></div>
              <div className="col-span-2"><Label className="text-xs">Time (min)</Label><Input type="number" value={form.timeTaken} onChange={(e) => setForm({ ...form, timeTaken: Number(e.target.value) })} /></div>
            </div>
            <div><Label className="text-xs">Weak subjects (comma-separated)</Label><Input value={form.weak} onChange={(e) => setForm({ ...form, weak: e.target.value })} placeholder="OS, DBMS" /></div>
            <div><Label className="text-xs">Mistakes / notes</Label><Textarea rows={2} value={form.mistakes} onChange={(e) => setForm({ ...form, mistakes: e.target.value })} /></div>
            <Button className="w-full">Save</Button>
          </form>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Score Trend</h3>
          {chart.length === 0 ? (
            <div className="grid h-64 place-items-center text-sm text-muted-foreground">Log mocks to see the trend.</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                  <XAxis dataKey="name" stroke="oklch(0.72 0.03 260)" fontSize={12} />
                  <YAxis stroke="oklch(0.72 0.03 260)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "oklch(0.20 0.03 270)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="oklch(0.68 0.19 275)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {[...data.mocks].sort((a, b) => b.date.localeCompare(a.date)).map((m) => (
              <li key={m.id} className="flex items-start justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()} · Acc {m.accuracy}% · {m.timeTaken}min</div>
                  {m.weakSubjects.length > 0 && <div className="mt-1 text-xs text-amber-300/80">Weak: {m.weakSubjects.join(", ")}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right"><div className="text-lg font-bold">{m.score}</div><div className="text-[10px] text-muted-foreground">/ {m.maxMarks}</div></div>
                  <Button size="icon" variant="ghost" onClick={() => deleteMock(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
