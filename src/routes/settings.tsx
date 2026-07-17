import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — GatePrep" }] }),
});

function SettingsPage() {
  const { data, hydrated, updateSettings, resetAll, exportJSON, importJSON } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  if (!hydrated) return null;

  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `gate-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const text = await f.text();
    if (importJSON(text)) toast.success("Imported!"); else toast.error("Invalid file");
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Targets, exam date, and your data." />
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-sm font-semibold">Preparation Targets</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label className="text-xs">Exam Date</Label><Input type="date" value={data.settings.examDate} onChange={(e) => updateSettings({ examDate: e.target.value })} /></div>
            <div><Label className="text-xs">Target Rank</Label><Input type="number" value={data.settings.targetRank} onChange={(e) => updateSettings({ targetRank: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Target Score (/100)</Label><Input type="number" value={data.settings.targetScore} onChange={(e) => updateSettings({ targetScore: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Daily hour target</Label><Input type="number" step={0.5} value={data.settings.dailyHourTarget} onChange={(e) => updateSettings({ dailyHourTarget: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Pomodoro Study (min)</Label><Input type="number" value={data.settings.pomodoroStudy} onChange={(e) => updateSettings({ pomodoroStudy: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Pomodoro Break (min)</Label><Input type="number" value={data.settings.pomodoroBreak} onChange={(e) => updateSettings({ pomodoroBreak: Number(e.target.value) })} /></div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-sm font-semibold">Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Everything is stored locally in your browser. Export a backup anytime, or import a previous one.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={download}><Download className="mr-2 h-4 w-4" /> Export JSON</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Import JSON</Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
            <Button variant="destructive" onClick={() => { if (confirm("Reset all data? This cannot be undone.")) { resetAll(); toast.success("Reset complete"); } }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset all data
            </Button>
          </div>
          <div className="mt-6 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-muted-foreground">
            <div>Subjects: {data.subjects.length} · Topics: {data.subjects.reduce((n, s) => n + s.topics.length, 0)}</div>
            <div>Logs: {data.logs.length} · Mocks: {data.mocks.length} · Goals: {data.goals.length}</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
