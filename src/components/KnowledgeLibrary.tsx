import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Clock, ExternalLink, GraduationCap, Lock, Search, Trophy, Unlock } from "lucide-react";
import { completeKnowledgeLesson, evaluateKnowledgeAnswer, knowledgeProgress, knowledgeSummary, normalizeKnowledgeCourse, unlockKnowledgeCourse, type KnowledgeCourse, type KnowledgeLesson } from "../core/knowledge";
import { createUniversalKnowledgeCourses } from "../core/knowledgeCatalog";
import "./KnowledgeLibrary.css";

type Props = { courses: any[]; credits: number; onChange: (courses: KnowledgeCourse[]) => void; onEconomy: (courses: KnowledgeCourse[], credits: number, xp: number) => void };
const categories = ["All subjects", "Science", "Technology", "Business", "Mathematics", "Psychology", "Humanities", "Philosophy", "Health science", "Creative arts", "Practical skills"];
const levels = ["All depths", "Foundation to Advanced"];
const categoryFor = (subject: string) => {
  const s = subject.toLowerCase();
  if (/health|body|wellbeing/.test(s)) return "Health science";
  if (/philosophy|ethic|logic/.test(s)) return "Philosophy";
  if (/physics|chemistry|biology|science|astronomy|environment/.test(s)) return "Science";
  if (/computer|program|technology|coding|ai|data|engineering/.test(s)) return "Technology";
  if (/business|finance|entrepreneur|marketing|econom|startup|invest/.test(s)) return "Business";
  if (/math|algebra|calculus|statistics/.test(s)) return "Mathematics";
  if (/psych|behavio|mental|cognitive/.test(s)) return "Psychology";
  if (/history|literature|politic|sociology|humanit/.test(s)) return "Humanities";
  if (/art|design|music|writing|creative|photography/.test(s)) return "Creative arts";
  if (/skill|language|communication|cooking|repair|practical/.test(s)) return "Practical skills";
  if (/research|thesis|academic|advanced/.test(s)) return "Advanced research";
  return "Practical skills";
};
export default function KnowledgeLibrary({ courses, credits, onChange, onEconomy }: Props) {
  const normalized = useMemo(() => courses.map(normalizeKnowledgeCourse).filter((c): c is KnowledgeCourse => !!c), [courses]);
  const [category, setCategory] = useState("All subjects");
  const [level, setLevel] = useState("All depths");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [activeLesson, setActiveLesson] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  useEffect(() => {
    const starter = createUniversalKnowledgeCourses();
    const starterIds = new Set(starter.map(course => course.id));
    const existingById = new Map(normalized.map(course => [course.id, course]));
    const refreshed = starter.map(seed => {
      const previous = existingById.get(seed.id);
      if (!previous) return seed;
      const previousLessons = new Map(previous.lessons.map(item => [item.id, item]));
      const lessons = seed.lessons.map(item => {
        const saved = previousLessons.get(item.id);
        return saved ? { ...item, done: saved.done, ...(saved.completedAt ? { completedAt: saved.completedAt } : {}) } : item;
      });
      return {
        ...seed,
        created: previous.created || seed.created,
        unlocked: previous.unlocked || seed.unlocked,
        lessons,
        done: lessons.length > 0 && lessons.every(item => item.done),
        ...(lessons.length > 0 && lessons.every(item => item.done) && previous.completedAt ? { completedAt: previous.completedAt } : {}),
        updatedAt: previous.updatedAt || seed.updatedAt
      };
    });
    const customCourses = normalized.filter(course => !starterIds.has(course.id));
    const merged = [...refreshed, ...customCourses];
    if (JSON.stringify(merged) !== JSON.stringify(normalized)) onChange(merged);
  }, [normalized, onChange]);
  const summary = knowledgeSummary(normalized);
  const current = normalized.find(c => c.id === selectedId) || null;
  const filtered = normalized.filter(c => {
    const matchesCategory = category === "All subjects" || categoryFor(c.subject) === category || c.subject.toLowerCase() === category.toLowerCase();
    const matchesLevel = level === "All depths" || c.level.toLowerCase() === level.toLowerCase();
    const searchable = [c.title, c.subject, c.description, ...c.objectives].join(" ").toLowerCase();
    return matchesCategory && matchesLevel && (!query.trim() || searchable.includes(query.toLowerCase().trim()));
  }).sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || Number(b.done) - Number(a.done) || a.title.localeCompare(b.title));

  const unlock = (course: KnowledgeCourse) => {
    const result = unlockKnowledgeCourse(normalized, course.id, credits, "spend");
    if (result.changed) onEconomy(result.courses, result.credits, 0);
    setFeedback(p => ({ ...p, [course.id]: result.reason }));
  };
  const finishLesson = (course: KnowledgeCourse, lesson: KnowledgeLesson) => {
    if (lesson.question) {
      const check = evaluateKnowledgeAnswer(lesson, answers[lesson.id]);
      if (!check.correct) { setFeedback(p => ({ ...p, [lesson.id]: "Not quite. " + check.explanation })); return; }
    }
    const result = completeKnowledgeLesson(normalized, course.id, lesson.id);
    if (result.changed) {
      onEconomy(result.courses, credits, result.xpAwarded);
      setFeedback(p => ({ ...p, [lesson.id]: result.reason + " · +" + result.xpAwarded + " XP" + (result.unlockedCourseIds.length ? " · next pathway unlocked" : "") }));
    }
  };

  return <div className="knowledge-library km">
    {!current ? <>
      <section className="km-intro"><div><span>UNIVERSAL KNOWLEDGE MARKETPLACE</span><h2>Explore the world of knowledge.</h2><p>A curated library of ready-made learning paths across science, technology, mathematics, health, society, business, arts and more. Start with foundations, build understanding and progress toward advanced mastery.</p></div><div className="km-emblem"><GraduationCap size={34}/></div></section>
      <div className="km-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the knowledge universe — science, history, finance, psychology..."/>{query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div>
      <div className="km-policy"><BookOpen size={18}/><p><b>Ready-made courses. Complete learning paths.</b><br/>Preview the curriculum, unlock a course once, and keep permanent access. Lessons and knowledge checks are included.</p></div>
      <div className="km-filters"><div className="km-cats">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><select value={level} onChange={e => setLevel(e.target.value)} aria-label="Filter by learning depth">{levels.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="km-market-stats"><span><BookOpen size={14}/> {summary.courses} curated courses</span><span><Unlock size={14}/> {summary.unlocked} permanently unlocked</span><span><Trophy size={14}/> {summary.completedCourses} mastered</span><b>{credits} credits available</b></div>
      <div className="km-heading"><div><h3>{category === "All subjects" ? "YOUR COURSE MARKETPLACE" : category.toUpperCase()}</h3><p>Explore curated subjects and structured learning paths</p></div></div>
      {filtered.length ? <div className="km-grid">{filtered.map(course => {
        const progress = knowledgeProgress(course);
        return <article className="km-card" key={course.id}><div className="km-cardtop"><span>{categoryFor(course.subject).toUpperCase()}</span><em>{course.unlocked ? "IN YOUR LIBRARY" : "AVAILABLE TO UNLOCK"}</em></div><div className="km-courseicon"><BookOpen size={19}/></div><small>{course.subject} · {course.level}</small><h4>{course.title}</h4><p>{course.description}</p><div className="km-cardmeta"><span><GraduationCap size={13}/> {course.lessons.length} lessons</span><span><Clock size={13}/> {progress.minutes} min</span></div><div className="km-cardfoot"><b>{course.unlockCost === 0 ? "FREE" : course.unlockCost + " CREDITS"}</b><button onClick={() => setSelectedId(course.id)}>{course.unlocked ? "OPEN COURSE" : "PREVIEW COURSE"} <ChevronRight size={14}/></button></div></article>;
      })}</div> : <div className="km-empty"><BookOpen size={28}/><b>{normalized.length ? "No matching courses in your catalogue" : "Your marketplace is ready"}</b><p>This subject is being prepared for the catalogue. Explore another domain while the universal library expands.</p></div>}
    </> : <>
      <button className="km-back" onClick={() => { setSelectedId(""); setActiveLesson(""); }}><ArrowLeft size={15}/> BACK TO MARKETPLACE</button>
      <section className="km-intro km-detail-intro"><div><span>{categoryFor(current.subject).toUpperCase()} / COURSE PREVIEW</span><h2>{current.title}</h2><p>{current.description}</p><div className="km-meta"><span>{current.subject}</span><span>{current.level}</span><span>{current.lessons.length} lessons</span><span>{knowledgeProgress(current).minutes} study minutes</span></div></div><div className="km-emblem"><BookOpen size={32}/></div></section>
      {!current.unlocked ? <div className="km-buy"><div><b>One-time permanent access</b><small>Pay once with credits. Keep this course forever and revisit all lessons without paying again. Assessments and retests are always free.</small></div><strong>{current.unlockCost === 0 ? "FREE" : current.unlockCost + " CREDITS"}</strong><button className="primary" disabled={credits < current.unlockCost} onClick={() => unlock(current)}>UNLOCK COURSE</button><small>{feedback[current.id] || (credits < current.unlockCost ? "Not enough credits yet." : "Your access will not expire.")}</small></div> : <div className="km-buy"><div><b><CheckCircle2 size={15}/> Permanently unlocked</b><small>All lessons and assessments are available. Assessments never cost credits.</small></div><strong>{current.done ? "MASTERED" : "IN PROGRESS"}</strong></div>}
      <div className="km-progress"><div><b>COURSE PROGRESS</b><strong>{knowledgeProgress(current).percent}%</strong><span>{knowledgeProgress(current).completed}/{knowledgeProgress(current).total} lessons completed</span></div><div className="km-track"><i style={{ width: knowledgeProgress(current).percent + "%" }}/></div></div>
      <h3 className="km-section-title">WHAT YOU WILL LEARN</h3>
      {current.objectives.length ? <ul className="km-outcomes">{current.objectives.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="muted">Learning outcomes are not available for this course.</p>}
      <div className="km-section-heading"><h3>CURRICULUM & LESSONS</h3></div>
      {current.lessons.map((lesson, index) => <article className="km-lesson-card" key={lesson.id}><button className="km-lesson" onClick={() => setActiveLesson(activeLesson === lesson.id ? "" : lesson.id)}><span className="km-index">{lesson.done ? <CheckCircle2 size={17}/> : String(index + 1).padStart(2, "0")}</span><div><b>{lesson.title}</b><small>{lesson.estimatedMinutes} min · {lesson.done ? "Completed" : "Lesson preview"}</small></div>{current.unlocked ? <ChevronRight size={16}/> : <Lock size={15}/>}</button>
        {activeLesson === lesson.id && <div className="km-reader"><h3>{lesson.title}</h3><p className="km-reader-intro">{lesson.summary}</p>{!current.unlocked ? <p className="muted">Unlock this course to access the full teaching content and assessment.</p> : <>
          <div className="km-reader-content">{lesson.content}</div>
          {lesson.objectives.length > 0 && <><b>KEY LEARNING POINTS</b><ul>{lesson.objectives.map((item, i) => <li key={i}>{item}</li>)}</ul></>}
          {lesson.resources.map((resource, i) => <p key={i}><a href={resource.url} target="_blank" rel="noreferrer">{resource.label} <ExternalLink size={12}/></a></p>)}
          {lesson.question && <div className="km-check"><b>KNOWLEDGE CHECK · FREE</b><p>{lesson.question.prompt}</p>{lesson.question.options.map((option, i) => <label key={i}><input type="radio" name={"quiz-" + lesson.id} checked={answers[lesson.id] === i} onChange={() => setAnswers(p => ({ ...p, [lesson.id]: i }))}/>{option}</label>)}</div>}
          {feedback[lesson.id] && <p className="km-feedback">{feedback[lesson.id]}</p>}
          <button className="primary km-finish" disabled={lesson.done || (!!lesson.question && answers[lesson.id] === undefined)} onClick={() => finishLesson(current, lesson)}>{lesson.done ? "LESSON COMPLETED" : "MARK LESSON COMPLETE"}</button>
        </>}</div>}</article>)}
      {current.done && <div className="km-last"><Trophy size={16}/> COURSE MASTERED · ALL LESSONS COMPLETED</div>}
    </>}
  </div>;
}
