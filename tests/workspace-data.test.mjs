import test from "node:test";
import assert from "node:assert/strict";
import { collectionForPage, filterWorkspaceRecords, removeWorkspaceRecord } from "../.test-build/workspaceData.js";

const pages = {
  Explore: "videos", Overview: "missions", Missions: "missions", Planner: "tasks",
  "Dream Life": "goals", Evolution: "evolution", Knowledge: "knowledge",
  Videos: "videos", Rewards: "rewards", Journal: "journal", Reports: "activity",
  Settings: "activity",
};

test("every navigable page has an explicit collection mapping", () => {
  for (const [page, collection] of Object.entries(pages)) {
    assert.equal(collectionForPage(page), collection);
  }
});

test("workspace filtering is case-insensitive, trims input and leaves source records unchanged", () => {
  const first = { id: "1", title: "Advanced Physics", created: "2026-11-01" };
  const second = { id: "2", title: "Business Strategy", created: "2026-11-02" };
  const data = {
    missions: [first, second], tasks: [], goals: [], knowledge: [], videos: [], evolution: [],
    rewards: [], journal: [], activity: [], achievementClaims: [], unlockedItems: [], xp: 0, credits: 0,
  };
  assert.deepEqual(filterWorkspaceRecords(data, "Missions", "  PHYSICS "), [first]);
  assert.deepEqual(filterWorkspaceRecords(data, "Missions", ""), [first, second]);
  assert.equal(data.missions.length, 2);
});

test("workspace deletion removes only the requested record from its mapped collection", () => {
  const first = { id: "1", title: "Keep", created: "2026-11-01" };
  const second = { id: "2", title: "Remove", created: "2026-11-02" };
  const data = {
    missions: [first, second], tasks: [], goals: [], knowledge: [], videos: [], evolution: [],
    rewards: [], journal: [], activity: [], achievementClaims: [], unlockedItems: [], xp: 0, credits: 0,
  };
  const next = removeWorkspaceRecord(data, "Missions", "2");
  assert.deepEqual(next.missions, [first]);
  assert.equal(data.missions.length, 2);
  assert.equal(next.tasks, data.tasks);
});
