import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData, subjectCompletion } from "@/lib/storage";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — GatePrep" }] }),
});

const COLORS = ["oklch(0.68 0.19 275)", "oklch(0.72 0.16 235)", "oklch(0.75 0.18 190)", "oklch(0.78 0.17 130)", "oklch(0.75 0.20 40)"];
const tooltipStyle = { background: "oklch(0.20 0.03 270)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8, color: "white" } as const;

function AnalyticsPage() {
  const { data, hydrated } = useData();

  const hoursBySubject = useMemo(() =>
    data.subjects.map((s) => ({ name: s.name.split(" ")[0].slice(0, 10), hours: Math.round(s.hours * 10) / 10 })), [data]);

  const completionBySubject = useMemo(() =>
    data.subjects.map((s) => ({ name: s.name.split(" ")[0].slice(0, 10), pct: subjectCompletion(s) })), [data]);

  const weekly = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const l of data.logs) {
      const k = l.date.slice(0, 10);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + l.hours);
    }
    return Array.from(map).map(([date, hours]) => ({ date: date.slice(5), hours: Math.round(hours * 10) / 10 }));
  }, [data]);

  const monthly = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const l of data.logs) {
      const k = l.date.slice(0, 10);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + l.hours);
    }
    return Array.from(map).map(([date, hours]) => ({ date: date.slice(5), hours: Math.round(hours * 10) / 10 }));
  }, [data]);

  const mockTrend = useMemo(() =>
    [...data.mocks].sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({ name: m.name.slice(0, 10) || m.date.slice(5), score: m.score })), [data]);

  const sorted = [...data.subjects].sort((a, b) => b.hours - a.hours);
  const most = sorted.slice(0, 3);
  const least = [...sorted].reverse().slice(0, 3);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Where your hours go and how your prep is trending." />

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Study Hours by Subject</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={hoursBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="name" stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill="oklch(0.68 0.19 275)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Completion % by Subject</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={completionBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="name" stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.03 260)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pct" fill="oklch(0.72 0.16 235)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Weekly Consistency</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="date" stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="hours" stroke="oklch(0.75 0.18 190)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Monthly Consistency</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="date" stroke="oklch(0.72 0.03 260)" fontSize={10} />
                <YAxis stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill="oklch(0.78 0.17 130)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Mock Score Trend</h3>
          <div className="h-64">
            {mockTrend.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No mocks yet.</div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={mockTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                  <XAxis dataKey="name" stroke="oklch(0.72 0.03 260)" fontSize={11} />
                  <YAxis stroke="oklch(0.72 0.03 260)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="score" stroke="oklch(0.68 0.19 275)" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Hours Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={hoursBySubject.filter((h) => h.hours > 0)} dataKey="hours" nameKey="name" innerRadius={45} outerRadius={90}>
                  {hoursBySubject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Most Studied</h3>
          <ul className="space-y-2">
            {most.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2">
                <span className="text-sm">{s.name}</span><span className="text-sm font-bold">{s.hours.toFixed(1)}h</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">Least Studied</h3>
          <ul className="space-y-2">
            {least.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2">
                <span className="text-sm">{s.name}</span><span className="text-sm font-bold text-amber-300">{s.hours.toFixed(1)}h</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
