export const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Discipline is the bridge between goals and accomplishment.",
  "You don't have to be great to start, but you have to start to be great.",
  "The expert in anything was once a beginner.",
  "Small progress is still progress.",
  "Focus on being productive instead of busy.",
  "One page a day is 365 pages a year.",
  "Consistency compounds. Every hour matters.",
  "The pain of discipline weighs ounces; the pain of regret weighs tons.",
  "Slow is smooth. Smooth is fast.",
  "Do the hard thing first.",
  "Your future is created by what you do today, not tomorrow.",
  "Motivation gets you started; habit keeps you going.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Every problem solved is a step closer to your rank.",
];

export function quoteOfTheDay(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const day = Math.floor(diff / 86400000);
  return QUOTES[day % QUOTES.length];
}
