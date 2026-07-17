import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData, totalHours } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/log")({
  component: LogPage,
  head: () => ({ meta: [{ title: "Study Log — GatePrep" }] }),
});

function LogPage() {
  const { data, hydrated, addLog, deleteLog } = useData();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState<string>("");
  const [hours, setHours] = useState(1);
  const [notes, setNotes] = useState("");

  if (!hydrated) return null;

  const subject = data.subjects.find((s) => s.id === subjectId);

  return (
    <div className="space-y-6">
      <PageHeader title="Study Log" subtitle={`${totalHours(data)} total hours across ${data.logs.length} sessions.`} />
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4" /> Add entry</h3>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!subjectId || hours <= 0) return;
              addLog({ date, subjectId, topicId: topicId || undefined, hours, notes });
              toast.success("Logged!");
              setHours(1); setNotes(""); setTopicId("");
            }}
          >
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Subject</Label>
              <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setTopicId(""); }}>
                <SelectTrigger><SelectValue placeholder="Choose subject" /></SelectTrigger>
                <SelectContent>
                  {data.subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {subject && (
              <div>
                <Label className="text-xs">Topic (optional)</Label>
                <Select value={topicId} onValueChange={setTopicId}>
                  <SelectTrigger><SelectValue placeholder="Any topic" /></SelectTrigger>
                  <SelectContent>
                    {subject.topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs">Hours</Label>
              <Input type="number" step={0.25} min={0} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you cover?" />
            </div>
            <Button type="submit" className="w-full">Add Entry</Button>
          </form>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">History</h3>
          {data.logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet. Log your first study session.</p>
          ) : (
            <ul className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
              {data.logs.map((l) => {
                const s = data.subjects.find((x) => x.id === l.subjectId);
                const t = s?.topics.find((x) => x.id === l.topicId);
                return (
                  <li key={l.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{s?.name ?? "Unknown"}</span>
                        {t && <span className="text-xs text-muted-foreground">· {t.name}</span>}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString()} · {l.hours}h</div>
                      {l.notes && <p className="mt-1 text-sm text-muted-foreground/90">{l.notes}</p>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteLog(l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
