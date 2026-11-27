import { habitStreak } from "./evolution";

export type Item = { id: string; title: string; created: string; [key: string]: any };
export type Data = {
  missions: Item[];
  tasks: Item[];
  goals: Item[];
  knowledge: Item[];
  videos: Item[];
  evolution: Item[];
  rewards: Item[];
  journal: Item[];
  activity: Item[];
  achievementClaims: string[];
  unlockedItems: string[];
  xp: number;
  credits: number;
};

export const blank: Data = {
  missions: [], tasks: [], goals: [], knowledge: [], videos: [], evolution: [],
  rewards: [], journal: [], activity: [], achievementClaims: [], unlockedItems: [],
  xp: 0, credits: 0,
};

export const today = () => {
  const date = new Date();
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
};

export const id = () => crypto.randomUUID();

export const rewardMetrics = (data: Data) => ({
  missionsCompleted: data.missions.filter(m => m.done || m.status === "Completed").length,
  businessMissionsCompleted: data.missions.filter(m => (m.done || m.status === "Completed") && String(m.category || "").toLowerCase() === "business").length,
  coursesCompleted: data.knowledge.filter(k => k.done).length,
  lessonsCompleted: data.knowledge.reduce((count, course) => count + (Array.isArray(course.lessons) ? course.lessons.filter((lesson: any) => lesson.done).length : (course.done ? 1 : 0)), 0),
  habitCheckIns: data.evolution.filter(record => record.kind === "habit").reduce((count, habit) => count + (Array.isArray(habit.checkIns) ? habit.checkIns.length : 0), 0),
  bestHabitStreak: Math.max(0, ...data.evolution.filter(record => record.kind === "habit").map(habit => habitStreak(habit, today()))),
  goalsCompleted: data.goals.filter(goal => goal.status === "Completed" || goal.done === true).length,
});
