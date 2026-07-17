export type TopicStatus = "not_started" | "learning" | "practicing" | "revising" | "completed";

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  completedDate?: string;
  revisionDates?: string[]; // upcoming/scheduled revision ISO dates
  completedRevisions?: string[]; // completed revision ISO dates
}

export interface Subject {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  topics: Topic[];
  hours: number;
}

export interface StudyLogEntry {
  id: string;
  date: string;
  subjectId: string;
  topicId?: string;
  hours: number;
  notes?: string;
}

export interface MockTest {
  id: string;
  name: string;
  date: string;
  score: number;
  maxMarks: number;
  accuracy: number;
  timeTaken: number; // minutes
  weakSubjects: string[];
  mistakes?: string;
}

export interface PYQRecord {
  subjectId: string;
  solved: number;
  remaining: number;
  easyAcc: number;
  mediumAcc: number;
  hardAcc: number;
}

export interface Goal {
  id: string;
  type: "weekly" | "monthly";
  title: string;
  target: number;
  progress: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedDate?: string;
}

export interface Settings {
  examDate: string; // ISO
  targetRank: number;
  targetScore: number;
  dailyHourTarget: number;
  estimatedScore: number;
  pomodoroStudy: number; // minutes
  pomodoroBreak: number;
  predictedColleges?: string[];
}

export interface AppData {
  version: number;
  subjects: Subject[];
  logs: StudyLogEntry[];
  mocks: MockTest[];
  pyqs: PYQRecord[];
  goals: Goal[];
  achievements: Achievement[];
  settings: Settings;
  pomodoroSessions: number;
}
