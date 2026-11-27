import type { Data, Item } from "./appData";
import type { Page } from "./navigation";

export type DataCollection = keyof Pick<Data,
  "missions" | "tasks" | "goals" | "knowledge" | "videos" | "evolution" | "rewards" | "journal"
>;

const PAGE_COLLECTION: Record<Page, DataCollection> = {
  Explore: "videos",
  Overview: "missions",
  Missions: "missions",
  Planner: "tasks",
  "Dream Life": "goals",
  Evolution: "evolution",
  Knowledge: "knowledge",
  Videos: "videos",
  Rewards: "rewards",
  Journal: "journal",
  Reports: "activity",
  Settings: "activity",
};

/** Explicitly maps every navigable workspace to its backing collection. */
export function collectionForPage(page: Page): DataCollection {
  return PAGE_COLLECTION[page];
}

/** Filters only the selected workspace's records, without mutating shared data. */
export function filterWorkspaceRecords(data: Data, page: Page, query: string): Item[] {
  const normalized = query.trim().toLocaleLowerCase();
  const records = data[collectionForPage(page)] as Item[];
  return normalized ? records.filter(record => record.title.toLocaleLowerCase().includes(normalized)) : records;
}
