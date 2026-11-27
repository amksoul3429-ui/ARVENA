import test from "node:test";
import assert from "node:assert/strict";
import {awardProgression,levelForXp,levelProgress,rankForLevel,skillLevelFromPractice,skillProgress} from "../.test-build/progression.js";
const state={xp:490,credits:12,activity:[]};
test("progression awards XP and credits atomically and advances level",()=>{const r=awardProgression(state,"mission:m1","Mission completed",30,3,"2026-11-27T00:00:00.000Z");assert.equal(r.awarded,true);assert.equal(r.state.xp,520);assert.equal(r.state.credits,15);assert.equal(levelForXp(r.state.xp),2);assert.equal(levelProgress(520).percent,4);});
test("the same event cannot pay twice",()=>{const first=awardProgression(state,"habit:h1:2026-11-27","Habit check-in",5,0);const second=awardProgression(first.state,"habit:h1:2026-11-27","Habit check-in",5,0);assert.equal(second.awarded,false);assert.equal(second.state.xp,495);assert.equal(second.state.activity.length,1);});
test("invalid and zero-value awards are rejected",()=>{assert.equal(awardProgression(state,"","x",10,1).awarded,false);assert.equal(awardProgression(state,"zero","x",0,0).awarded,false);});
test("ranks and skill practice progression are deterministic and capped",()=>{assert.equal(rankForLevel(5).title,"Strategist");assert.equal(skillLevelFromPractice(600),3);assert.deepEqual(skillProgress(600),{level:3,minutesIntoLevel:0,minutesToNext:300,percent:0});assert.equal(skillLevelFromPractice(9000),10);});
