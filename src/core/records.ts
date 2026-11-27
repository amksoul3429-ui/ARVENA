import type { Data, Item } from "./appData";
import { syncMissionTask } from "./planner";
import type { Page } from "./navigation";

export type RecordPage = Extract<Page, "Missions" | "Planner" | "Dream Life" | "Knowledge" | "Rewards" | "Journal">;
export type RecordSaveOptions = { now?: string; createId?: () => string };

const collectionFor = (page: RecordPage) => ({
  Missions: "missions",
  Planner: "tasks",
  "Dream Life": "goals",
  Knowledge: "knowledge",
  Rewards: "rewards",
  Journal: "journal",
}[page] as "missions" | "tasks" | "goals" | "knowledge" | "rewards" | "journal");

/** Builds the canonical record and updates its collection without coupling forms to App.tsx. */
export function saveRecord(
  data: Data,
  page: RecordPage,
  form: FormData,
  editing: Item | null,
  options: RecordSaveOptions = {},
): Data {
  const value = (name: string) => String(form.get(name) || "");
  const old = editing;
  const base: Item = {
    id: old?.id || (options.createId || (() => crypto.randomUUID()))(),
    title: value("title"),
    created: old?.created || options.now || new Date().toISOString(),
  };
  let item: Item = base;

  if (page === "Missions") item = {
    ...base, description: value("description"), category: value("category"),
    difficulty: value("difficulty"), priority: value("priority"), xp: +value("xp"),
    deadline: value("deadline"), status: old?.status || "Available",
    done: old?.done || false, completedAt: old?.completedAt,
  };
  if (page === "Planner") item = {
    ...base, date: value("date"), category: value("category"), priority: value("priority"),
    done: old?.done || false, missionId: old?.missionId, startTime: value("startTime"),
    durationMinutes: +value("durationMinutes"), notes: value("notes"),
  };
  if (page === "Dream Life") item = {
    ...base, description: value("description"), area: value("area"),
    target: value("target"), progress: +value("progress"),
  };
  if (page === "Knowledge") item = {
    ...base, subject: value("subject"), level: value("level"), done: old?.done || false,
  };
  if (page === "Rewards") item = {
    ...base, description: value("description"), type: value("type"),
    cost: +value("cost"), redeemed: old?.redeemed || false,
  };
  if (page === "Journal") item = {
    ...base, content: value("content"), mood: value("mood"),
  };

  const collection = collectionFor(page);
  const next: Data = {
    ...data,
    [collection]: old
      ? data[collection].map(record => record.id === old.id ? item : record)
      : [item, ...data[collection]],
  };
  if (page === "Missions" && old) {
    next.tasks = syncMissionTask(data.tasks as any, item as any) as Item[];
  }
  return next;
}
