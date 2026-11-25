import test from "node:test";
import assert from "node:assert/strict";
import { parseAIJson, normalizeAICourse } from "../.test-build/aiTeacher.js";

test("AI teacher parses plain and fenced JSON responses", () => {
  assert.deepEqual(parseAIJson('{"status":"ok"}'), {status:"ok"});
  assert.deepEqual(parseAIJson('```json\n{"status":"ok"}\n```'), {status:"ok"});
});

test("AI teacher rejects malformed and undersized generated curricula", () => {
  assert.throws(() => parseAIJson("No JSON was returned"));
  assert.throws(() => normalizeAICourse({lessons:[]}, "Vectors", "Beginner"));
});

test("AI teacher validates course lessons and assessment answers", () => {
  const lessons = Array.from({length:8}, (_,i) => ({
    title:"Lesson "+i, summary:"Summary "+i, content:"A detailed teaching explanation. ".repeat(8),
    objectives:["Understand the concept"], estimatedMinutes:20,
    question:{prompt:"Which answer is correct?",options:["A","B","C","D"],answerIndex:2,explanation:"Because the definition establishes this result."}
  }));
  const course = normalizeAICourse({title:"Vector foundations",description:"A structured course",objectives:["Understand vectors"],lessons}, "Vectors", "Beginner to advanced", "2026-11-25T00:00:00.000Z");
  assert.equal(course.lessons.length,8);
  assert.equal(course.lessons[0].question.answerIndex,2);
  assert.equal(course.unlocked,true);
  assert.equal(course.subject,"Vectors");
  assert.equal(course.lessons[0].done,false);
});

test("AI teacher rejects short lessons and invalid quiz answer indexes", () => {
  const lessons = Array.from({length:5}, (_,i) => ({title:"Lesson "+i,content:"Too short",question:{prompt:"Q",options:["A","B"],answerIndex:0}}));
  assert.throws(() => normalizeAICourse({lessons}, "Test", "Beginner"));
});
