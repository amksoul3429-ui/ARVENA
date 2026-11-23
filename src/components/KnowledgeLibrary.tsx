import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Clock, ExternalLink, GraduationCap, Lock, Search, Sparkles, Trophy, Unlock, LoaderCircle } from "lucide-react";
import { completeKnowledgeLesson, evaluateKnowledgeAnswer, knowledgeProgress, knowledgeSummary, normalizeKnowledgeCourse, unlockKnowledgeCourse, type KnowledgeCourse, type KnowledgeLesson } from "../core/knowledge";
import "./KnowledgeLibrary.css";

type Props = { courses: any[]; credits: number; onChange: (courses: KnowledgeCourse[]) => void; onEconomy: (courses: KnowledgeCourse[], credits: number, xp: number) => void };
const uid = () => crypto.randomUUID();
const categories = ["All subjects", "Science", "Technology", "Business", "Mathematics", "Psychology", "Humanities", "Creative arts", "Practical skills", "Advanced research"];
const levels = ["All levels", "Beginner", "Foundation", "Intermediate", "Advanced", "Expert", "Research"];
const priceTiers = [5, 10, 20, 25, 50, 100, 200, 500];
const arr = (v: unknown): any[] => Array.isArray(v) ? v : [];
const categoryFor = (subject: string) => {
  const s = subject.toLowerCase();
  if (/physics|chemistry|biology|science|astronomy|environment/.test(s)) return "Science";
  if (/computer|program|technology|coding|ai|data|engineering/.test(s)) return "Technology";
  if (/business|finance|entrepreneur|marketing|econom|startup|invest/.test(s)) return "Business";
  if (/math|algebra|calculus|statistics/.test(s)) return "Mathematics";
  if (/psych|behavio|mental|cognitive/.test(s)) return "Psychology";
  if (/history|philosophy|literature|politic|sociology|humanit/.test(s)) return "Humanities";
  if (/art|design|music|writing|creative|photography/.test(s)) return "Creative arts";
  if (/skill|language|communication|cooking|repair|practical/.test(s)) return "Practical skills";
  if (/research|thesis|academic|advanced/.test(s)) return "Advanced research";
  return "Practical skills";
};
const parseReply = (reply: string) => {
  const fence = String.fromCharCode(96).repeat(3);
  const cleaned = reply.trim().replace(fence + "json", "").replace(fence, "").trim();
  return JSON.parse(cleaned);
};

export default function KnowledgeLibrary({ courses, credits, onChange, onEconomy }: Props) {
  const normalized = useMemo(() => courses.map(normalizeKnowledgeCourse).filter((c): c is KnowledgeCourse => !!c), [courses]);
  const [category, setCategory] = useState("All subjects");
  const [level, setLevel] = useState("All levels");
  const [generationLevel, setGenerationLevel] = useState("Beginner");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [activeLesson, setActiveLesson] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const summary = knowledgeSummary(normalized);
  const current = normalized.find(c => c.id === selectedId) || null;
  const filtered = normalized.filter(c => {
    const matchesCategory = category === "All subjects" || categoryFor(c.subject) === category || c.subject.toLowerCase() === category.toLowerCase();
    const matchesLevel = level === "All levels" || c.level.toLowerCase() === level.toLowerCase();
    const searchable = [c.title, c.subject, c.description, ...c.objectives].join(" ").toLowerCase();
    return matchesCategory && matchesLevel && (!query.trim() || searchable.includes(query.toLowerCase().trim()));
  }).sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || Number(b.done) - Number(a.done) || a.title.localeCompare(b.title));

  const generateCourse = async () => {
    const topic = query.trim();
    if (!topic || generating) return;
    const endpoint = (localStorage.getItem("arvena-aeris-endpoint-v1") || "").trim().replace(/\/+$/, "");
    const token = (localStorage.getItem("arvena-aeris-token-v1") || "").trim();
    if (!endpoint || !token) {
      setGenerationError("AERIS is not connected. Open the AERIS assistant, choose Settings, and connect your secure AI service. Your search will remain here.");
      return;
    }
    setGenerating(true); setGenerationError("");
    const prompt = "Create a rigorous, self-contained learning course for the topic: " + topic + ". Target level: " + generationLevel + ". Build a coherent pathway covering the essential prerequisites for this level through full mastery. Include 8 to 12 logically ordered lessons. Each lesson needs a clear summary and detailed teaching content (roughly 150–250 words) with explanations, examples, practical applications and common mistakes where relevant. Include 3–6 measurable course outcomes. Add one multiple-choice knowledge check per lesson, with 4 options, a zero-based answerIndex and a useful explanation. Do not invent citations or URLs; use an empty resources array unless you know a trustworthy exact URL. Choose a fair one-time marketplace price from this exact list: 5, 10, 20, 25, 50, 100, 200, 500 credits. Return ONLY one valid JSON object, no markdown, with this shape: {title, subject, level, description, objectives:[], unlockCost:number, lessons:[{title, summary, content, objectives:[], estimatedMinutes:number, resources:[], question:{prompt, options:[], answerIndex:number, explanation}}]}. The course is locked until previewed and purchased once with credits.";
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "X-ARVENA-ACCESS": token }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "AERIS could not generate the course. Check its connection and try again.");
      if (typeof payload.reply !== "string" || !payload.reply.trim()) throw new Error("AERIS returned an empty course. Please try again.");
      const result = parseReply(payload.reply);
      if (typeof result.title !== "string" || !result.title.trim() || !Array.isArray(result.lessons) || result.lessons.length < 1) throw new Error("AERIS returned an incomplete course structure. Please try again.");
      const rawPrice = Number(result.unlockCost);
      const unlockCost = priceTiers.reduce((best, price) => Math.abs(price - rawPrice) < Math.abs(best - rawPrice) ? price : best, 20);
      const now = new Date().toISOString();
      const lessons: KnowledgeLesson[] = arr(result.lessons).map((lesson: any, index: number) => {
        const options = arr(lesson.question?.options).filter((x: unknown): x is string => typeof x === "string");
        const question = typeof lesson.question?.prompt === "string" && options.length >= 2 ? { prompt: lesson.question.prompt, options, answerIndex: Math.max(0, Math.min(options.length - 1, Number(lesson.question.answerIndex) || 0)), explanation: String(lesson.question.explanation || "") } : undefined;
        return { id: uid(), title: String(lesson.title || "Lesson " + (index + 1)), summary: String(lesson.summary || ""), content: String(lesson.content || ""), objectives: arr(lesson.objectives).filter((x: unknown): x is string => typeof x === "string"), estimatedMinutes: Math.max(5, Math.min(600, Number(lesson.estimatedMinutes) || 20)), resources: arr(lesson.resources).filter((r: any) => r && typeof r.url === "string" && /^https?:\/\//i.test(r.url)).map((r: any) => ({ label: String(r.label || "Reference"), url: r.url })), ...(question ? { question } : {}), done: false };
      });
      if (!lessons.length || lessons.some(lesson => !lesson.title.trim() || !lesson.content.trim())) throw new Error("AERIS generated lessons without complete teaching content. Try again.");
      const course: KnowledgeCourse = { id: uid(), title: result.title.trim(), created: now, subject: String(result.subject || topic), level: generationLevel, description: String(result.description || ""), objectives: arr(result.objectives).filter((x: unknown): x is string => typeof x === "string"), prerequisiteCourseId: "", unlockCost, unlocked: false, lessons, done: false, updatedAt: now };
      onChange([course, ...normalized]); setSelectedId(course.id); setActiveLesson(""); setGenerationError("");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Course generation failed. Please try again.");
    } finally { setGenerating(false); }
  };

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
      <section className="km-intro"><div><span>ARVENA KNOWLEDGE MARKETPLACE</span><h2>Explore. Unlock. Master.</h2><p>Search any subject or skill. AERIS builds a structured course with a curriculum, detailed lessons and assessments. Preview it first, then unlock permanent access once with credits.</p></div><div className="km-emblem"><GraduationCap size={34}/></div></section>
      <div className="km-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void generateCourse(); }} placeholder="Search any topic — e.g. organic chemistry, Python, investing..."/>{query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div>
      <div className="km-generatebar"><label>COURSE LEVEL<select value={generationLevel} onChange={e => setGenerationLevel(e.target.value)}>{levels.slice(1).map(item => <option key={item}>{item}</option>)}</select></label><button className="primary" onClick={() => void generateCourse()} disabled={!query.trim() || generating}>{generating ? <><LoaderCircle className="km-spin" size={15}/> GENERATING COURSE...</> : <><Sparkles size={15}/> GENERATE WITH AERIS</>}</button></div>
      {generationError && <div className="km-error" role="alert">{generationError}</div>}
      <div className="km-filters"><div className="km-cats">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><select value={level} onChange={e => setLevel(e.target.value)} aria-label="Filter by learning level">{levels.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="km-market-stats"><span><BookOpen size={14}/> {summary.courses} generated courses</span><span><Unlock size={14}/> {summary.unlocked} permanently unlocked</span><span><Trophy size={14}/> {summary.completedCourses} mastered</span><b>{credits} credits available</b></div>
      <div className="km-heading"><div><h3>{category === "All subjects" ? "YOUR COURSE MARKETPLACE" : category.toUpperCase()}</h3><p>Browse your generated catalogue or search a new topic above</p></div></div>
      {filtered.length ? <div className="km-grid">{filtered.map(course => {
        const progress = knowledgeProgress(course);
        return <article className="km-card" key={course.id}><div className="km-cardtop"><span>{categoryFor(course.subject).toUpperCase()}</span><em>{course.unlocked ? "IN YOUR LIBRARY" : "AVAILABLE TO UNLOCK"}</em></div><div className="km-courseicon"><BookOpen size={19}/></div><small>{course.subject} · {course.level}</small><h4>{course.title}</h4><p>{course.description}</p><div className="km-cardmeta"><span><GraduationCap size={13}/> {course.lessons.length} lessons</span><span><Clock size={13}/> {progress.minutes} min</span></div><div className="km-cardfoot"><b>{course.unlockCost === 0 ? "FREE" : course.unlockCost + " CREDITS"}</b><button onClick={() => setSelectedId(course.id)}>{course.unlocked ? "OPEN COURSE" : "PREVIEW COURSE"} <ChevronRight size={14}/></button></div></article>;
      })}</div> : <div className="km-empty"><BookOpen size={28}/><b>{normalized.length ? "No matching courses in your catalogue" : "Your marketplace is ready"}</b><p>Search any topic above and ask AERIS to generate a complete course. You do not need to create subjects or lessons manually.</p></div>}
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
