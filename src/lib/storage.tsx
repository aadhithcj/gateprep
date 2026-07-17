import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData, Subject, Topic, TopicStatus, StudyLogEntry, MockTest, PYQRecord, Goal, Achievement, Settings } from "./types";
import { DEFAULT_SUBJECTS } from "./syllabus";

const STORAGE_KEY = "gate-cs-2027-tracker-v1";
const DATA_VERSION = 1;

const DEFAULT_SETTINGS: Settings = {
  examDate: "2027-02-06",
  targetRank: 100,
  targetScore: 75,
  dailyHourTarget: 6,
  estimatedScore: 0,
  pomodoroStudy: 25,
  pomodoroBreak: 5,
};

const REVISION_INTERVALS = [1, 3, 7, 15, 30];

function makeDefaultData(): AppData {
  return {
    version: DATA_VERSION,
    subjects: DEFAULT_SUBJECTS,
    logs: [],
    mocks: [],
    pyqs: DEFAULT_SUBJECTS.map((s) => ({
      subjectId: s.id,
      solved: 0,
      remaining: 30,
      easyAcc: 0,
      mediumAcc: 0,
      hardAcc: 0,
    })),
    goals: [],
    achievements: [],
    settings: DEFAULT_SETTINGS,
    pomodoroSessions: 0,
  };
}

function loadData(): AppData {
  if (typeof window === "undefined") return makeDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefaultData();
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== DATA_VERSION) return makeDefaultData();
    // ensure new subjects added later are merged
    const existingIds = new Set(parsed.subjects.map((s) => s.id));
    for (const s of DEFAULT_SUBJECTS) {
      if (!existingIds.has(s.id)) parsed.subjects.push(s);
    }
    if (!parsed.pyqs) parsed.pyqs = [];
    return parsed;
  } catch {
    return makeDefaultData();
  }
}

interface Ctx {
  data: AppData;
  hydrated: boolean;
  setData: (updater: (d: AppData) => AppData) => void;
  toggleTopic: (subjectId: string, topicId: string) => void;
  setTopicStatus: (subjectId: string, topicId: string, status: TopicStatus) => void;
  addLog: (entry: Omit<StudyLogEntry, "id">) => void;
  deleteLog: (id: string) => void;
  addMock: (m: Omit<MockTest, "id">) => void;
  deleteMock: (id: string) => void;
  updatePYQ: (subjectId: string, patch: Partial<PYQRecord>) => void;
  addGoal: (g: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  completeRevision: (subjectId: string, topicId: string, date: string) => void;
  resetAll: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
  incrementPomodoro: () => void;
}

const DataContext = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(() => makeDefaultData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDataState(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data, hydrated]);

  const setData = useCallback((updater: (d: AppData) => AppData) => {
    setDataState((prev) => updater(prev));
  }, []);

  const setTopicStatus = useCallback((subjectId: string, topicId: string, status: TopicStatus) => {
    setDataState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id !== topicId) return t;
            const wasCompleted = t.status === "completed";
            const nowCompleted = status === "completed";
            let revisionDates = t.revisionDates ?? [];
            let completedDate = t.completedDate;
            if (!wasCompleted && nowCompleted) {
              completedDate = new Date().toISOString();
              const base = new Date();
              revisionDates = REVISION_INTERVALS.map((d) => {
                const nd = new Date(base);
                nd.setDate(nd.getDate() + d);
                return nd.toISOString();
              });
            }
            if (wasCompleted && !nowCompleted) {
              revisionDates = [];
              completedDate = undefined;
            }
            return { ...t, status, completedDate, revisionDates };
          }),
        };
      }),
    }));
  }, []);

  const toggleTopic = useCallback((subjectId: string, topicId: string) => {
    setDataState((prev) => {
      const subject = prev.subjects.find((s) => s.id === subjectId);
      const topic = subject?.topics.find((t) => t.id === topicId);
      if (!topic) return prev;
      const nextStatus: TopicStatus = topic.status === "completed" ? "not_started" : "completed";
      // just call setTopicStatus logic inline
      return {
        ...prev,
        subjects: prev.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          return {
            ...s,
            topics: s.topics.map((t) => {
              if (t.id !== topicId) return t;
              const nowCompleted = nextStatus === "completed";
              let revisionDates = t.revisionDates ?? [];
              let completedDate = t.completedDate;
              if (nowCompleted) {
                completedDate = new Date().toISOString();
                const base = new Date();
                revisionDates = REVISION_INTERVALS.map((d) => {
                  const nd = new Date(base);
                  nd.setDate(nd.getDate() + d);
                  return nd.toISOString();
                });
              } else {
                revisionDates = [];
                completedDate = undefined;
              }
              return { ...t, status: nextStatus, completedDate, revisionDates };
            }),
          };
        }),
      };
    });
  }, []);

  const addLog = useCallback((entry: Omit<StudyLogEntry, "id">) => {
    setDataState((prev) => {
      const log: StudyLogEntry = { ...entry, id: crypto.randomUUID() };
      const subjects = prev.subjects.map((s) =>
        s.id === entry.subjectId ? { ...s, hours: s.hours + entry.hours } : s
      );
      return { ...prev, logs: [log, ...prev.logs], subjects };
    });
  }, []);

  const deleteLog = useCallback((id: string) => {
    setDataState((prev) => {
      const log = prev.logs.find((l) => l.id === id);
      if (!log) return prev;
      const subjects = prev.subjects.map((s) =>
        s.id === log.subjectId ? { ...s, hours: Math.max(0, s.hours - log.hours) } : s
      );
      return { ...prev, logs: prev.logs.filter((l) => l.id !== id), subjects };
    });
  }, []);

  const addMock = useCallback((m: Omit<MockTest, "id">) => {
    setDataState((prev) => ({
      ...prev,
      mocks: [{ ...m, id: crypto.randomUUID() }, ...prev.mocks],
    }));
  }, []);

  const deleteMock = useCallback((id: string) => {
    setDataState((prev) => ({ ...prev, mocks: prev.mocks.filter((m) => m.id !== id) }));
  }, []);

  const updatePYQ = useCallback((subjectId: string, patch: Partial<PYQRecord>) => {
    setDataState((prev) => ({
      ...prev,
      pyqs: prev.pyqs.map((p) => (p.subjectId === subjectId ? { ...p, ...patch } : p)),
    }));
  }, []);

  const addGoal = useCallback((g: Omit<Goal, "id" | "createdAt">) => {
    setDataState((prev) => ({
      ...prev,
      goals: [
        { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ...prev.goals,
      ],
    }));
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setDataState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setDataState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setDataState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const completeRevision = useCallback((subjectId: string, topicId: string, date: string) => {
    setDataState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id !== topicId) return t;
            return {
              ...t,
              revisionDates: (t.revisionDates ?? []).filter((d) => d !== date),
              completedRevisions: [...(t.completedRevisions ?? []), date],
            };
          }),
        };
      }),
    }));
  }, []);

  const incrementPomodoro = useCallback(() => {
    setDataState((prev) => ({ ...prev, pomodoroSessions: prev.pomodoroSessions + 1 }));
  }, []);

  const resetAll = useCallback(() => setDataState(makeDefaultData()), []);

  const exportJSON = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as AppData;
      if (!parsed.version) return false;
      setDataState(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      data,
      hydrated,
      setData,
      toggleTopic,
      setTopicStatus,
      addLog,
      deleteLog,
      addMock,
      deleteMock,
      updatePYQ,
      addGoal,
      updateGoal,
      deleteGoal,
      updateSettings,
      completeRevision,
      resetAll,
      exportJSON,
      importJSON,
      incrementPomodoro,
    }),
    [data, hydrated, setData, toggleTopic, setTopicStatus, addLog, deleteLog, addMock, deleteMock, updatePYQ, addGoal, updateGoal, deleteGoal, updateSettings, completeRevision, resetAll, exportJSON, importJSON, incrementPomodoro]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

// Derived helpers
export function subjectCompletion(subject: Subject): number {
  if (subject.topics.length === 0) return 0;
  const done = subject.topics.filter((t) => t.status === "completed").length;
  return Math.round((done / subject.topics.length) * 100);
}

export function subjectStatus(subject: Subject): "Not Started" | "Learning" | "Practicing" | "Revising" | "Completed" {
  const c = subjectCompletion(subject);
  if (c === 100) return "Completed";
  const anyRevising = subject.topics.some((t) => t.status === "revising");
  const anyPracticing = subject.topics.some((t) => t.status === "practicing");
  const anyLearning = subject.topics.some((t) => t.status === "learning" || t.status === "completed");
  if (anyRevising) return "Revising";
  if (anyPracticing) return "Practicing";
  if (anyLearning) return "Learning";
  return "Not Started";
}

export function overallCompletion(data: AppData): number {
  const total = data.subjects.reduce((n, s) => n + s.topics.length, 0);
  if (!total) return 0;
  const done = data.subjects.reduce((n, s) => n + s.topics.filter((t) => t.status === "completed").length, 0);
  return Math.round((done / total) * 100);
}

export function totalHours(data: AppData): number {
  return Math.round(data.logs.reduce((n, l) => n + l.hours, 0) * 10) / 10;
}

export function currentStreak(data: AppData): number {
  if (data.logs.length === 0) return 0;
  const daySet = new Set(data.logs.map((l) => l.date.slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  // include today only if logged; else start from yesterday
  const today = cur.toISOString().slice(0, 10);
  if (!daySet.has(today)) cur.setDate(cur.getDate() - 1);
  for (;;) {
    const key = cur.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else break;
  }
  return streak;
}

export function daysUntilExam(examDate: string): number {
  const now = new Date();
  const exam = new Date(examDate);
  return Math.max(0, Math.ceil((exam.getTime() - now.getTime()) / 86400000));
}

export function overdueRevisions(data: AppData) {
  const now = new Date();
  const items: { subject: string; subjectId: string; topic: string; topicId: string; date: string; overdue: boolean }[] = [];
  for (const s of data.subjects) {
    for (const t of s.topics) {
      for (const d of t.revisionDates ?? []) {
        items.push({
          subject: s.name,
          subjectId: s.id,
          topic: t.name,
          topicId: t.id,
          date: d,
          overdue: new Date(d) < now,
        });
      }
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}
