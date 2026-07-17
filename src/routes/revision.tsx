import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader } from "@/components/PageHeader";
import { useData, overdueRevisions } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/revision")({
  component: RevisionPage,
  head: () => ({ meta: [{ title: "Revision — GatePrep" }] }),
});

function RevisionPage() {
  const { data, hydrated, completeRevision } = useData();
  if (!hydrated) return null;
  const items = overdueRevisions(data);
  const overdue = items.filter((i) => i.overdue);
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = items.filter((i) => !i.overdue && i.date.slice(0, 10) === today);
  const upcoming = items.filter((i) => !i.overdue && i.date.slice(0, 10) !== today);

  const Section = ({ title, list, tone }: { title: string; list: typeof items; tone: "danger" | "primary" | "muted" }) => (
    <GlassCard>
      <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span className="flex items-center gap-2">
          {tone === "danger" && <AlertCircle className="h-4 w-4 text-destructive" />}
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{list.length}</span>
      </h3>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((r) => (
            <li key={r.topicId + r.date} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.topic}</div>
                <div className="truncate text-xs text-muted-foreground">{r.subject} · {new Date(r.date).toLocaleDateString()}</div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => { completeRevision(r.subjectId, r.topicId, r.date); toast.success("Revision done!"); }}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Done
              </Button>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Revision Tracker" subtitle="Spaced repetition at 1 · 3 · 7 · 15 · 30 days." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Overdue" list={overdue} tone="danger" />
        <Section title="Due today" list={dueToday} tone="primary" />
        <Section title="Upcoming" list={upcoming} tone="muted" />
      </div>
    </div>
  );
}
