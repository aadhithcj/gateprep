import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Flame, GraduationCap, ListChecks, Sparkles, Target, TrendingUp, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { GlassCard } from "@/components/GlassCard";
import { CircularProgress } from "@/components/CircularProgress";
import { PageHeader } from "@/components/PageHeader";
import { useData, overallCompletion, totalHours, currentStreak, daysUntilExam, overdueRevisions } from "@/lib/storage";
import { quoteOfTheDay } from "@/lib/quotes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { estimateScoreWithAI } from "@/lib/ai";
import { toast } from "sonner";
export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — GatePrep" }],
  }),
});

function Dashboard() {
  const { data, hydrated, updateSettings } = useData();
  const [isEstimating, setIsEstimating] = useState(false);

  async function handleEstimateScore() {
    setIsEstimating(true);
    try {
      const { estimatedScore, reasoning } = await estimateScoreWithAI(data);
      updateSettings({ estimatedScore });
      toast.success("Score Estimated", { description: reasoning, duration: 10000 });
    } catch (error) {
      toast.error("Failed to estimate score", { description: "Please try again later." });
    } finally {
      setIsEstimating(false);
    }
  }

  if (!hydrated) return <div className="animate-pulse text-muted-foreground">Loading your progress…</div>;

  const days = daysUntilExam(data.settings.examDate);
  const completion = overallCompletion(data);
  const hours = totalHours(data);
  const streak = currentStreak(data);
  const subjectsCompleted = data.subjects.filter((s) => s.topics.length && s.topics.every((t) => t.status === "completed")).length;
  const topicsCompleted = data.subjects.reduce((n, s) => n + s.topics.filter((t) => t.status === "completed").length, 0);
  const totalTopics = data.subjects.reduce((n, s) => n + s.topics.length, 0);
  const mocksTaken = data.mocks.length;

  const today = new Date().toISOString().slice(0, 10);
  const todaysTasks = overdueRevisions(data).filter((r) => r.date.slice(0, 10) <= today).slice(0, 6);
  const upcoming = overdueRevisions(data).filter((r) => r.date.slice(0, 10) > today).slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Good day, aadhith" 
        subtitle="Every hour compounds. Let's make today count." 
        action={
          <div className="flex gap-2">
            <Link to="/log" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              + Log Study
            </Link>
            <Link to="/mocks" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              + Add Mock
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Days to GATE" value={days} sub={new Date(data.settings.examDate).toDateString()} icon={CalendarDays} accent="brand" />
        <StatCard label="Study Streak" value={`${streak}d`} sub="Keep it burning" icon={Flame} accent="warn" />
        <StatCard label="Total Hours" value={hours} sub={`${data.logs.length} sessions`} icon={Clock} accent="brand2" />
        <StatCard label="Mock Tests" value={mocksTaken} sub={mocksTaken ? "Nice grind" : "Take your first"} icon={ListChecks} accent="ok" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center justify-center gap-2 lg:col-span-1">
          <div className="flex w-full items-center justify-between px-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall Syllabus</div>
            {streak > 0 && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-500 uppercase">On Track</span>}
          </div>
          <CircularProgress value={completion} size={180} stroke={14} label="Complete" sublabel={`${topicsCompleted}/${totalTopics} topics`} />
          <div className="mt-2 grid w-full grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-xl font-bold">{subjectsCompleted}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Subjects done</div>
            </div>
            <div>
              <div className="text-xl font-bold">{topicsCompleted}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Topics done</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Quote of the day</div>
          </div>
          <p className="font-display text-xl leading-snug md:text-2xl">"{quoteOfTheDay()}"</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> Target Score
              </div>
              <div className="mt-1 text-2xl font-bold">{data.settings.targetScore} <span className="text-sm text-muted-foreground">/ 100</span></div>
              <div className="text-xs text-muted-foreground">Target Rank ≤ {data.settings.targetRank}</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Estimated Score
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs px-2 gap-1"
                  onClick={handleEstimateScore}
                  disabled={isEstimating}
                >
                  {isEstimating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-primary" />}
                  Auto-Calculate
                </Button>
              </div>
              <Input
                type="number"
                value={data.settings.estimatedScore}
                onChange={(e) => updateSettings({ estimatedScore: Number(e.target.value) })}
                className="mt-1 h-10 bg-transparent text-2xl font-bold border-none px-0 focus-visible:ring-0"
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Today's Revisions</h3>
            <Link to="/revision" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {todaysTasks.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground">All caught up. Complete more topics to schedule revisions.</p>
              <Link to="/subjects" className="text-xs font-medium text-primary hover:underline">Go to Subjects &rarr;</Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todaysTasks.map((t) => {
                const subject = data.subjects.find(s => s.name === t.subject);
                return (
                <li key={t.topicId + t.date} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.topic}</div>
                    <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      {subject?.color && <svg viewBox="0 0 8 8" className={`h-2 w-2 ${subject.color} fill-current`}><circle cx="4" cy="4" r="4"/></svg>}
                      {t.subject}
                    </div>
                  </div>
                  <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] " + (t.overdue ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary")}>
                    {t.overdue ? "Overdue" : "Due"}
                  </span>
                </li>
              )})}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upcoming Revision</h3>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground">Nothing scheduled ahead yet.</p>
              <Link to="/revision" className="text-xs font-medium text-primary hover:underline">View Revision Plan &rarr;</Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((t) => {
                const subject = data.subjects.find(s => s.name === t.subject);
                return (
                <li key={t.topicId + t.date} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.topic}</div>
                    <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      {subject?.color && <svg viewBox="0 0 8 8" className={`h-2 w-2 ${subject.color} fill-current`}><circle cx="4" cy="4" r="4"/></svg>}
                      {t.subject}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</span>
                </li>
              )})}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
