import test from "node:test";
import assert from "node:assert/strict";
import { transitionMission, assignMissionToPlanner, missionReward } from "../.test-build/missions.js";
import { syncMissionTask, getDaySummary, removeMissionTasks } from "../.test-build/planner.js";
import { addGoalMilestone, toggleGoalMilestone, goalProgress } from "../.test-build/goals.js";
import { recordHabitCheckIn, evolutionSummary } from "../.test-build/evolution.js";
import { normalizeJournalEntry, upsertJournalEntry, filterJournalEntries, journalSummary } from "../.test-build/journal.js";
import { summarizeReports } from "../.test-build/reports.js";

const day = "2026-11-27";
const mission = { id:"m1", title:"Finish portfolio", created:day, category:"Career", priority:"High", deadline:day, difficulty:"Medium" };

test("life-system workflow: mission assignment, planner sync, completion and exactly-once reward", () => {
  const assigned = assignMissionToPlanner([mission], [], "m1", day, "t1");
  assert.equal(assigned.ok, true);
  assert.equal(assigned.tasks[0].title, mission.title);
  assert.equal(assignMissionToPlanner([mission], assigned.tasks, "m1", day, "t2").ok, false);
  const synced = syncMissionTask(assigned.tasks, { id:"m1", title:"Updated portfolio", category:"Business", priority:"Critical", deadline:"2026-11-28" });
  assert.equal(synced[0].title, "Updated portfolio");
  assert.equal(synced[0].date, "2026-11-28");
  assert.deepEqual(getDaySummary([{...synced[0],date:day,done:true}], day), {total:1,completed:1,remaining:0,scheduled:0,plannedMinutes:0,percent:100});
  const activated = transitionMission([mission], "m1", "Active", day);
  assert.equal(activated.ok, true);
  const completed = transitionMission(activated.missions, "m1", "Completed", day);
  assert.equal(completed.ok, true);
  assert.equal(transitionMission(completed.missions, "m1", "Completed", day).ok, false);
  assert.deepEqual(missionReward(mission), {xp:50,credits:5});
  assert.equal(removeMissionTasks(synced, "m1").length, 0);
});

test("life-system workflow: goal milestones calculate progress and complete the goal", () => {
  const goal = { id:"g1",title:"Build a portfolio",created:day,description:"",area:"Career",target:"",priority:"High",status:"Active",why:"",nextAction:"",progress:0,milestones:[],updatedAt:day };
  const added = addGoalMilestone([goal], "g1", {id:"s1",title:"Publish first case study",done:false,dueDate:day}, day);
  assert.equal(added.changed, true);
  const toggled = toggleGoalMilestone(added.goals, "g1", "s1", day);
  assert.equal(toggled.changed, true);
  assert.equal(goalProgress(toggled.goals[0]), 100);
  assert.equal(toggled.goals[0].status, "Completed");
});

test("life-system workflow: habit check-ins are idempotent and appear in evolution summaries", () => {
  const habit = {id:"h1",title:"Read",created:day,kind:"habit",description:"",category:"Learning",frequency:"Daily",targetPerWeek:7,active:true,checkIns:[]};
  const first = recordHabitCheckIn([habit], "h1", day, day);
  assert.equal(first.changed, true);
  assert.equal(first.xpAwarded, 5);
  const duplicate = recordHabitCheckIn(first.records, "h1", day, day);
  assert.equal(duplicate.changed, false);
  assert.equal(duplicate.xpAwarded, 0);
  assert.equal(evolutionSummary(first.records, day).checkedToday, 1);
});

test("life-system workflow: journal search, favorites, streak and reporting stay consistent", () => {
  const entry = normalizeJournalEntry({id:"j1",title:"A focused day",created:day+"T10:00:00.000Z",date:day,content:"I learned and made meaningful progress.",mood:"Focused",category:"Growth",tags:["review"],favorite:true});
  assert.ok(entry);
  const entries = upsertJournalEntry([], entry);
  assert.equal(filterJournalEntries(entries,{query:"meaningful",favoritesOnly:true}).length, 1);
  assert.equal(journalSummary(entries, day).currentStreak, 1);
  const report = summarizeReports({journal:entries,missions:[{id:"m1",title:"Done",created:day,completedAt:day,status:"Completed"}],tasks:[{id:"t1",title:"Done",created:day,date:day,done:true}],xp:55,credits:5},{start:day,end:day});
  assert.equal(report.totals.journalEntries, 1);
  assert.equal(report.totals.journalWords, 6);
  assert.equal(report.totals.missions, 1);
  assert.equal(report.totals.tasks, 1);
  assert.equal(report.totals.completionRate, 100);
});
