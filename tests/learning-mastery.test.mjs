import test from "node:test";
import assert from "node:assert/strict";
import { dueKnowledgeReviews, recordKnowledgeReview, knowledgeMastery } from "../.test-build/learningMastery.js";

const course={id:"c1",title:"Foundations",created:"2026-01-01",subject:"Science",level:"Foundation",unlocked:true,done:false,lessons:[
{id:"l1",title:"Atoms",done:true,completedAt:"2026-01-01",estimatedMinutes:20,reviewIntervalDays:0,reviewStreak:0,assessmentAttempts:0,assessmentCorrect:0},
{id:"l2",title:"Forces",done:false,estimatedMinutes:20}
]};
test("revision queue only includes completed lessons that are due and unlocked",()=>{
 const due={...course,lessons:[{...course.lessons[0],reviewDueAt:"2026-11-26T00:00:00.000Z"},{...course.lessons[1],done:true,reviewDueAt:"2026-11-27T00:00:00.000Z"}]};
 assert.deepEqual(dueKnowledgeReviews([due],"2026-11-27").map(x=>x.lessonId),["l1","l2"]);
 assert.equal(dueKnowledgeReviews([{...due,unlocked:false}],"2026-11-27").length,0);
});
test("correct revision schedules progressively longer intervals and records assessment accuracy",()=>{
 let state=[course];
 state=recordKnowledgeReview(state,"c1","l1",true,"2026-11-27T00:00:00.000Z").courses;
 let lesson=state[0].lessons[0];
 assert.equal(lesson.reviewIntervalDays,1);assert.equal(lesson.reviewStreak,1);assert.equal(lesson.assessmentAttempts,1);assert.equal(lesson.assessmentCorrect,1);
 state=recordKnowledgeReview(state,"c1","l1",true,"2026-11-28T00:00:00.000Z").courses;
 assert.equal(state[0].lessons[0].reviewIntervalDays,2);
 state=recordKnowledgeReview(state,"c1","l1",true,"2026-11-30T00:00:00.000Z").courses;
 assert.equal(state[0].lessons[0].reviewIntervalDays,4);
 assert.equal(knowledgeMastery(state).masteredLessons,1);
});
test("incorrect revision resets streak and schedules an early retry",()=>{
 const initial=[{...course,lessons:[{...course.lessons[0],reviewIntervalDays:8,reviewStreak:3}]}];
 const result=recordKnowledgeReview(initial,"c1","l1",false,"2026-11-27T00:00:00.000Z");
 const lesson=result.courses[0].lessons[0];
 assert.equal(lesson.reviewStreak,0);assert.equal(lesson.reviewIntervalDays,1);assert.equal(lesson.assessmentAttempts,1);assert.equal(lesson.assessmentCorrect,0);
 assert.equal(lesson.reviewDueAt,"2026-11-28T00:00:00.000Z");
});
test("mastery summary reports review accuracy and due queue count",()=>{
 const reviewed={...course,lessons:[{...course.lessons[0],reviewDueAt:"2026-11-26T00:00:00.000Z",reviewStreak:3,assessmentAttempts:4,assessmentCorrect:3}]};
 const summary=knowledgeMastery([reviewed]);
 assert.equal(summary.masteredLessons,1);assert.equal(summary.assessmentAccuracy,75);assert.equal(summary.dueReviews,1);
});
