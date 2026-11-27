import { normalizeKnowledgeCourse, type KnowledgeCourse } from "./knowledge.js";

const DAY = 86400000;
const dateKey = (value: string | Date) => {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0,10);
};
export function dueKnowledgeReviews(values: unknown[], today = dateKey(new Date())) {
  return values.map(normalizeKnowledgeCourse).filter((c): c is KnowledgeCourse => !!c && c.unlocked)
    .flatMap(course => course.lessons.filter(lesson => lesson.done && lesson.reviewDueAt && lesson.reviewDueAt.slice(0,10) <= today)
      .map(lesson => ({courseId:course.id,courseTitle:course.title,lessonId:lesson.id,lessonTitle:lesson.title,dueAt:lesson.reviewDueAt!})))
    .sort((a,b)=>a.dueAt.localeCompare(b.dueAt));
}
export function recordKnowledgeReview(values: unknown[], courseId: string, lessonId: string, correct: boolean, now = new Date().toISOString()) {
  const courses = values.map(normalizeKnowledgeCourse).filter((c): c is KnowledgeCourse => !!c);
  let changed = false;
  const next = courses.map(course => course.id !== courseId ? course : {...course,lessons:course.lessons.map(lesson=>{
    if(lesson.id!==lessonId)return lesson;
    changed=true;
    const streak = correct ? lesson.reviewStreak + 1 : 0;
    const interval = correct ? (lesson.reviewIntervalDays===0?1:Math.min(90,Math.max(1,lesson.reviewIntervalDays*2))) : 1;
    const due = new Date(new Date(now).getTime()+interval*DAY).toISOString();
    return {...lesson,reviewStreak:streak,reviewIntervalDays:interval,lastReviewedAt:now,reviewDueAt:due,
      assessmentAttempts:lesson.assessmentAttempts+1,assessmentCorrect:lesson.assessmentCorrect+(correct?1:0)};
  })});
  return {changed,courses:next,reviewDue:dueKnowledgeReviews(next,dateKey(now)),mastery:knowledgeMastery(next)};
}
export function knowledgeMastery(values: unknown[]) {
  const courses=values.map(normalizeKnowledgeCourse).filter((c):c is KnowledgeCourse=>!!c);
  const lessons=courses.flatMap(c=>c.lessons);
  const completed=lessons.filter(l=>l.done);
  const reviewed=completed.filter(l=>l.assessmentAttempts>0);
  const mastered=completed.filter(l=>l.reviewStreak>=3);
  return {completedLessons:completed.length,reviewedLessons:reviewed.length,masteredLessons:mastered.length,
    masteryPercent:completed.length?Math.round(mastered.length/completed.length*100):0,
    assessmentAccuracy:reviewed.length?Math.round(completed.reduce((n,l)=>n+l.assessmentCorrect,0)/completed.reduce((n,l)=>n+l.assessmentAttempts,0)*100):0,
    dueReviews:dueKnowledgeReviews(courses).length};
}
