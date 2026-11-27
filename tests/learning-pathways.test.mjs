import test from "node:test";
import assert from "node:assert/strict";
import { createUniversalKnowledgeCourses } from "../.test-build/knowledgeCatalog.js";
import { normalizeKnowledgeCourse, completeKnowledgeLesson, unlockKnowledgeCourse } from "../.test-build/knowledge.js";

test("universal catalogue contains prerequisite-linked subject pathways",()=>{
 const courses=createUniversalKnowledgeCourses("2026-11-27T00:00:00.000Z");
 const byId=new Map(courses.map(c=>[c.id,c]));
 assert.equal(byId.get("universal-technology").prerequisiteCourseId,"universal-mathematics");
 assert.equal(byId.get("universal-business").prerequisiteCourseId,"universal-economics");
 assert.equal(byId.get("universal-health").prerequisiteCourseId,"universal-science");
 assert.equal(byId.get("universal-technology").unlocked,false);
 assert.equal(byId.get("universal-science").unlocked,true);
});
test("mastery and revision metadata survives course normalization",()=>{
 const c=normalizeKnowledgeCourse({id:"c",title:"Course",unlocked:true,lessons:[{id:"l",title:"Lesson",done:true,reviewIntervalDays:4,reviewStreak:3,reviewDueAt:"2026-12-01T00:00:00.000Z",assessmentAttempts:5,assessmentCorrect:4}]});
 assert.equal(c.lessons[0].reviewIntervalDays,4);assert.equal(c.lessons[0].reviewStreak,3);
 assert.equal(c.lessons[0].assessmentAttempts,5);assert.equal(c.lessons[0].assessmentCorrect,4);
});
test("completing a prerequisite automatically unlocks its pathway successor",()=>{
 const base={id:"base",title:"Base",unlocked:true,lessons:[{id:"l",title:"Lesson",done:false}]};
 const next={id:"next",title:"Next",unlocked:false,prerequisiteCourseId:"base",unlockCost:20,lessons:[{id:"n",title:"Next lesson",done:false}]};
 const result=completeKnowledgeLesson([base,next],"base","l","2026-11-27T00:00:00.000Z");
 assert.equal(result.courseCompleted,true);assert.deepEqual(result.unlockedCourseIds,["next"]);
 assert.equal(result.courses.find(c=>c.id==="next").unlocked,true);
});
