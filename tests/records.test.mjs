import test from "node:test";
import assert from "node:assert/strict";
import { saveRecord } from "../.test-build/records.js";

const empty = {
  missions: [], tasks: [], goals: [], knowledge: [], videos: [], evolution: [],
  rewards: [], journal: [], activity: [], achievementClaims: [], unlockedItems: [],
  xp: 0, credits: 0,
};
function fields(values) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, String(value));
  return form;
}

test("creating a mission maps form fields into the shared mission collection", () => {
  const next = saveRecord(empty, "Missions", fields({
    title: "Complete calculus", description: "Limits and derivatives", category: "Studies",
    difficulty: "Hard", priority: "High", xp: 80, deadline: "2026-12-15",
  }), null, { now: "2026-11-27T10:00:00.000Z", createId: () => "mission-1" });
  assert.equal(next.missions.length, 1);
  assert.deepEqual(next.missions[0], {
    id: "mission-1", title: "Complete calculus", created: "2026-11-27T10:00:00.000Z",
    description: "Limits and derivatives", category: "Studies", difficulty: "Hard",
    priority: "High", xp: 80, deadline: "2026-12-15", status: "Available",
    done: false, completedAt: undefined,
  });
});

test("editing a mission preserves workflow state and synchronizes its linked planner task", () => {
  const original = {
    ...empty,
    missions: [{ id: "m1", title: "Old title", created: "2026-11-01", status: "Active", done: false, xp: 40 }],
    tasks: [{ id: "t1", title: "Old title", created: "2026-11-01", date: "2026-11-30", missionId: "m1", done: false }],
  };
  const next = saveRecord(original, "Missions", fields({
    title: "New title", description: "Updated", category: "Business",
    difficulty: "Medium", priority: "Critical", xp: 60, deadline: "2026-12-20",
  }), original.missions[0], { now: "ignored" });
  assert.equal(next.missions[0].status, "Active");
  assert.equal(next.missions[0].created, "2026-11-01");
  assert.equal(next.missions[0].title, "New title");
  assert.equal(next.tasks[0].title, "New title");
  assert.equal(next.tasks[0].category, "Business");
  assert.equal(next.tasks[0].priority, "Critical");
  assert.equal(next.tasks[0].date, "2026-12-20");
});

test("record form mapping writes each workspace to its intended collection", () => {
  const cases = [
    ["Planner", "tasks", { title: "Plan study", date: "2026-11-28", category: "Study", priority: "High", startTime: "09:00", durationMinutes: 45, notes: "Focus" }],
    ["Dream Life", "goals", { title: "Build a studio", description: "Long-term vision", area: "Career", target: "2027-01-01", progress: 20 }],
    ["Knowledge", "knowledge", { title: "Physics", subject: "Mechanics", level: "Beginner" }],
    ["Rewards", "rewards", { title: "Book", description: "Reward", type: "Personal", cost: 20 }],
    ["Journal", "journal", { title: "Reflection", content: "Today I learned", mood: "Calm" }],
  ];
  for (const [page, collection, values] of cases) {
    const next = saveRecord(empty, page, fields(values), null, { now: "2026-11-27", createId: () => page });
    assert.equal(next[collection].length, 1, page);
    assert.equal(next[collection][0].title, values.title, page);
    assert.equal(next[collection][0].id, page, page);
  }
});

test("editing a record replaces only the matching record and preserves its creation date", () => {
  const original = {
    ...empty,
    journal: [
      { id: "j1", title: "Old", created: "2026-11-01", content: "Before", mood: "Tired" },
      { id: "j2", title: "Keep", created: "2026-11-02", content: "Untouched", mood: "Calm" },
    ],
  };
  const next = saveRecord(original, "Journal", fields({ title: "Updated", content: "After", mood: "Focused" }), original.journal[0]);
  assert.equal(next.journal.length, 2);
  assert.deepEqual(next.journal[0], { id: "j1", title: "Updated", created: "2026-11-01", content: "After", mood: "Focused" });
  assert.equal(next.journal[1], original.journal[1]);
});
