import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Clock, ExternalLink, GraduationCap, Lock, Plus, Search, Trophy, Unlock, X } from "lucide-react";
import {
  completeKnowledgeLesson, evaluateKnowledgeAnswer, knowledgeProgress, knowledgeSummary,
  normalizeKnowledgeCourse, unlockKnowledgeCourse,
  type KnowledgeCourse, type KnowledgeLesson,
} from "../core/knowledge";
import "./KnowledgeLibrary.css";

type Props = {
  courses: any[];
  credits: number;
  onChange: (courses: KnowledgeCourse[]) => void;
  onEconomy: (courses: KnowledgeCourse[], credits: number, xp: number) => void;
};
const uid = () => crypto.randomUUID();
const categories = ["All subjects", "Science", "Technology", "Business", "Mathematics", "Psychology", "Humanities", "Creative arts", "Practical skills", "Advanced research"];
const levels = ["All levels", "Beginner", "Foundation", "Intermediate", "Advanced", "Expert", "Research"];
const priceTiers = [0, 5, 10, 20, 25, 50, 100, 200, 500];
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

export default function KnowledgeLibrary({ courses, credits, onChange, onEconomy }: Props) {
  const normalized = useMemo(() => courses.map(normalizeKnowledgeCourse).filter((c): c is KnowledgeCourse => !!c), [courses]);
  const [category, setCategory] = useState("All subjects");
  const [level, setLevel] = useState("All levels");
  const [query, setQuery] = useState("");
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [courseEditor, setCourseEditor] = useState<KnowledgeCourse | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);
  const [lessonEditor, setLessonEditor] = useState<KnowledgeLesson | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const summary = knowledgeSummary(normalized);
  const current = normalized.find(c => c.id === selectedId) || null;
  const filtered = normalized.filter(c => {
    const matchesCategory = category === "All subjects" || categoryFor(c.subject) === category || c.subject.toLowerCase() === category.toLowerCase();
    const matchesLevel = level === "All levels" || c.level.toLowerCase() === level.toLowerCase();
    const text = [c.title, c.subject, c.description, ...c.objectives].join(" ").toLowerCase();
    return matchesCategory && matchesLevel && (!query.trim() || text.includes(query.toLowerCase().trim())) && (!ownedOnly || c.unlocked);
  }).sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || Number(b.done) - Number(a.done) || a.title.localeCompare(b.title));

  const saveCourse = (form: HTMLFormElement) => {
    const f = new FormData(form), value = (key: string) => String(f.get(key) || "");
    const old = courseEditor;
    const prerequisite = value("prerequisite");
    const next: KnowledgeCourse = {
      id: old?.id || uid(), title: value("title").trim(), created: old?.created || new Date().toISOString(),
      subject: value("subject").trim(), level: value("level"), description: value("description"),
      objectives: value("objectives").split("\n").map(x => x.trim()).filter(Boolean),
      prerequisiteCourseId: prerequisite, unlockCost: Math.max(0, Number(value("unlockCost")) || 0),
      unlocked: old?.unlocked ?? (!prerequisite && Number(value("unlockCost")) === 0),
      lessons: old?.lessons || [], done: old?.done || false, updatedAt: new Date().toISOString(),
    };
    onChange(old ? normalized.map(c => c.id === old.id ? next : c) : [...normalized, next]);
    setSelectedId(next.id); setCourseOpen(false); setCourseEditor(null);
  };

  const saveLesson = (form: HTMLFormElement) => {
    if (!current) return;
    const f = new FormData(form), value = (key: string) => String(f.get(key) || "");
    const options = value("options").split("\n").map(x => x.trim()).filter(Boolean);
    const question = value("question").trim() && options.length >= 2 ? {
      prompt: value("question"), options,
      answerIndex: Math.max(0, Math.min(options.length - 1, Number(value("answerIndex")) || 0)),
      explanation: value("explanation"),
    } : undefined;
    const old = lessonEditor;
    const lesson: KnowledgeLesson = {
      id: old?.id || uid(), title: value("title").trim(), summary: value("summary"),
      content: value("content"), objectives: value("objectives").split("\n").map(x => x.trim()).filter(Boolean),
      estimatedMinutes: Math.max(1, Number(value("minutes")) || 20),
      resources: value("url").trim() ? [{ label: value("source") || "Reference", url: value("url") }] : [],
      ...(question ? { question } : {}), done: old?.done || false, ...(old?.completedAt ? { completedAt: old.completedAt } : {}),
    };
    onChange(normalized.map(c => c.id === current.id ? {
      ...c, lessons: old ? c.lessons.map(l => l.id === old.id ? lesson : l) : [...c.lessons, lesson],
      done: false, updatedAt: new Date().toISOString(),
    } : c));
    setLessonOpen(false); setLessonEditor(null);
  };

  const unlock = (course: KnowledgeCourse, mode: "spend" | "milestone") => {
    const result = unlockKnowledgeCourse(normalized, course.id, credits, mode);
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

  const deleteCourse = (course: KnowledgeCourse) => {
    if (!confirm("Remove this course and its learning progress?")) return;
    onChange(normalized.filter(c => c.id !== course.id)); setSelectedId("");
  };
  const deleteLesson = (course: KnowledgeCourse, lesson: KnowledgeLesson) => {
    if (!confirm("Delete this lesson and its progress?")) return;
    const lessons = course.lessons.filter(l => l.id !== lesson.id);
    onChange(normalized.map(c => c.id === course.id ? { ...c, lessons, done: lessons.length > 0 && lessons.every(l => l.done), completedAt: undefined, updatedAt: new Date().toISOString() } : c));
    setActiveLesson("");
  };

  return (
    <div className="knowledge-library km">
      {!current ? <>
        <section className="km-intro">
          <div><span>ARVENA KNOWLEDGE MARKETPLACE</span><h2>Explore. Unlock. Master.</h2><p>Discover structured learning pathways across every field. Preview the curriculum, compare levels and unlock a course once with credits—then keep it permanently.</p></div>
          <div className="km-emblem"><GraduationCap size={34}/></div>
        </section>
        <div className="km-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search any subject, skill or course..."/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={16}/></button>}</div>
        <div className="km-filters">
          <div className="km-cats">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <label className="km-owned"><input type="checkbox" checked={ownedOnly} onChange={e => setOwnedOnly(e.target.checked)}/> My library</label>
          <select value={level} onChange={e => setLevel(e.target.value)} aria-label="Filter by learning level">{levels.map(item => <option key={item}>{item}</option>)}</select>
        </div>
        <div className="km-market-stats"><span><BookOpen size={14}/> {summary.courses} courses in your catalogue</span><span><Unlock size={14}/> {summary.unlocked} permanently unlocked</span><span><Trophy size={14}/> {summary.completedCourses} mastered</span><b>{credits} credits available</b></div>
        <div className="km-heading"><div><h3>{ownedOnly ? "MY LEARNING LIBRARY" : category === "All subjects" ? "EXPLORE THE CATALOGUE" : category.toUpperCase()}</h3><p>Preview course scope and outcomes before you unlock</p></div><button className="primary" onClick={() => { setCourseEditor(null); setCourseOpen(true); }}><Plus size={14}/> ADD A COURSE</button></div>
        {filtered.length ? <div className="km-grid">{filtered.map(course => {
          const progress = knowledgeProgress(course);
          const price = course.unlockCost === 0 ? "FREE" : course.unlockCost + " CREDITS";
          return <article className="km-card" key={course.id}>
            <div className="km-cardtop"><span>{categoryFor(course.subject).toUpperCase()}</span><em>{course.unlocked ? "IN YOUR LIBRARY" : course.unlockCost === 0 ? "FREE ACCESS" : "AVAILABLE TO UNLOCK"}</em></div>
            <div className="km-courseicon"><BookOpen size={19}/></div>
            <small>{course.subject} · {course.level}</small><h4>{course.title}</h4>
            <p>{course.description || "A structured learning pathway. Open the preview to review its scope, outcomes and lessons."}</p>
            <div className="km-cardmeta"><span><GraduationCap size={13}/> {course.lessons.length} lessons</span><span><Clock size={13}/> {progress.minutes} min</span></div>
            <div className="km-cardfoot"><b>{price}</b><button onClick={() => setSelectedId(course.id)}>{course.unlocked ? "OPEN COURSE" : "PREVIEW COURSE"} <ChevronRight size={14}/></button></div>
          </article>;
        })}</div> : <div className="km-empty"><BookOpen size={28}/><b>{normalized.length ? "No matching courses" : "Your marketplace is ready for its first course"}</b><p>{normalized.length ? "Try another subject, search term or learning level." : "Add a course to begin building your catalogue. Each course can include its full curriculum, outcomes, lessons and a one-time credit price."}</p><button className="primary" onClick={() => { setCourseEditor(null); setCourseOpen(true); }}><Plus size={14}/> CREATE FIRST COURSE</button></div>}
      </> : <>
        <button className="km-back" onClick={() => { setSelectedId(""); setActiveLesson(""); }}><ArrowLeft size={15}/> BACK TO MARKETPLACE</button>
        <section className="km-intro km-detail-intro"><div><span>{categoryFor(current.subject).toUpperCase()} / COURSE PREVIEW</span><h2>{current.title}</h2><p>{current.description || "Explore the curriculum, learning outcomes and lesson sequence for this pathway."}</p><div className="km-meta"><span>{current.subject}</span><span>{current.level}</span><span>{current.lessons.length} lessons</span><span>{knowledgeProgress(current).minutes} study minutes</span></div></div><div className="km-emblem"><BookOpen size={32}/></div></section>
        {!current.unlocked ? <div className="km-buy"><div><b>{current.unlockCost === 0 ? "Free course" : "One-time permanent access"}</b><small>{current.unlockCost === 0 ? "Unlock this course at no cost." : "Pay once with credits. Keep permanent access and revisit lessons without paying again."}</small></div><strong>{current.unlockCost === 0 ? "FREE" : current.unlockCost + " CREDITS"}</strong><button className="primary" disabled={credits < current.unlockCost || (!!current.prerequisiteCourseId && current.unlockCost === 0)} onClick={() => unlock(current, "spend")}>{current.unlockCost === 0 ? "OPEN FREE COURSE" : "UNLOCK COURSE"}</button>{current.prerequisiteCourseId && <button className="secondary" onClick={() => unlock(current, "milestone")}>CHECK PREREQUISITE</button>}<small>{feedback[current.id] || (credits < current.unlockCost ? "Not enough credits yet." : "Your access will not expire.")}</small></div> : <div className="km-buy"><div><b><CheckCircle2 size={15}/> Permanently unlocked</b><small>All lessons and assessments are available. Assessments never cost credits.</small></div><strong>{current.done ? "MASTERED" : "IN PROGRESS"}</strong><button className="secondary" onClick={() => { setCourseEditor(current); setCourseOpen(true); }}>EDIT COURSE</button><button className="secondary" onClick={() => deleteCourse(current)}>REMOVE</button></div>}
        <div className="km-progress"><div><b>COURSE PROGRESS</b><strong>{knowledgeProgress(current).percent}%</strong><span>{knowledgeProgress(current).completed}/{knowledgeProgress(current).total} lessons completed</span></div><div className="km-track"><i style={{width: knowledgeProgress(current).percent + "%"}}/></div></div>
        <h3 className="km-section-title">WHAT YOU WILL LEARN</h3>
        {current.objectives.length ? <ul className="km-outcomes">{current.objectives.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="muted">Learning outcomes will appear here when added to the course.</p>}
        <div className="km-section-heading"><h3>CURRICULUM & LESSONS</h3>{current.unlocked && <button className="secondary" onClick={() => { setLessonEditor(null); setLessonOpen(true); }}><Plus size={14}/> ADD LESSON</button>}</div>
        {current.lessons.map((lesson, index) => <article className="km-lesson-card" key={lesson.id}>
          <button className="km-lesson" onClick={() => setActiveLesson(activeLesson === lesson.id ? "" : lesson.id)}><span className="km-index">{lesson.done ? <CheckCircle2 size={17}/> : String(index + 1).padStart(2, "0")}</span><div><b>{lesson.title}</b><small>{lesson.estimatedMinutes} min · {lesson.done ? "Completed" : "Lesson preview"}</small></div>{current.unlocked ? <ChevronRight size={16}/> : <Lock size={15}/>}</button>
          {activeLesson === lesson.id && <div className="km-reader">
            <h3>{lesson.title}</h3><p className="km-reader-intro">{lesson.summary || "Lesson overview"}</p>
            {!current.unlocked ? <p className="muted">Unlock this course to access the complete lesson and assessment.</p> : <>
              <div className="km-reader-content">{lesson.content || "Lesson content has not been added yet."}</div>
              {lesson.objectives.length > 0 && <><b>KEY LEARNING POINTS</b><ul>{lesson.objectives.map((item, i) => <li key={i}>{item}</li>)}</ul></>}
              {lesson.resources.map((resource, i) => <p key={i}><a href={resource.url} target="_blank" rel="noreferrer">{resource.label} <ExternalLink size={12}/></a></p>)}
              {lesson.question && <div className="km-check"><b>KNOWLEDGE CHECK</b><p>{lesson.question.prompt}</p>{lesson.question.options.map((option, i) => <label key={i}><input type="radio" name={"quiz-" + lesson.id} checked={answers[lesson.id] === i} onChange={() => setAnswers(p => ({...p, [lesson.id]: i}))}/>{option}</label>)}</div>}
              {feedback[lesson.id] && <p className="km-feedback">{feedback[lesson.id]}</p>}
              <div className="km-reader-actions"><button className="secondary" onClick={() => { setLessonEditor(lesson); setLessonOpen(true); }}>EDIT LESSON</button><button className="danger" onClick={() => deleteLesson(current, lesson)}>DELETE</button><button className="primary" disabled={lesson.done || (!!lesson.question && answers[lesson.id] === undefined)} onClick={() => finishLesson(current, lesson)}>{lesson.done ? "COMPLETED" : "MARK COMPLETE"}</button></div>
            </>}
          </div>}
        </article>)}
        {!current.lessons.length && <div className="km-empty"><BookOpen size={24}/><b>Curriculum outline not added yet</b><p>Add modules and lessons to complete this course listing.</p>{current.unlocked && <button className="primary" onClick={() => { setLessonEditor(null); setLessonOpen(true); }}><Plus size={14}/> ADD FIRST LESSON</button>}</div>}
        {current.done && <div className="km-last"><Trophy size={16}/> COURSE MASTERED · ALL LESSONS COMPLETED</div>}
      </>}

      {courseOpen && <div className="backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCourseOpen(false); }}><form className="modal" onSubmit={e => {e.preventDefault(); saveCourse(e.currentTarget);}}>
        <div className="modalhead"><div><small>KNOWLEDGE MARKETPLACE</small><h2>{courseEditor ? "Edit course listing" : "Create course listing"}</h2></div><button type="button" onClick={() => setCourseOpen(false)}><X/></button></div>
        <label>Course title<input name="title" required maxLength={120} defaultValue={courseEditor?.title || ""}/></label>
        <div className="formgrid"><label>Subject / category<input name="subject" required defaultValue={courseEditor?.subject || ""} placeholder="e.g. Physics, Business, Psychology"/></label><label>Learning level<select name="level" defaultValue={courseEditor?.level || "Beginner"}>{levels.slice(1).map(x => <option key={x}>{x}</option>)}</select></label></div>
        <label>Course description<textarea name="description" defaultValue={courseEditor?.description || ""} placeholder="Explain the scope and who this course is for."/></label>
        <label>Learning outcomes (one per line)<textarea name="objectives" defaultValue={courseEditor?.objectives.join("\n") || ""}/></label>
        <label>Prerequisite course<select name="prerequisite" defaultValue={courseEditor?.prerequisiteCourseId || ""}><option value="">No prerequisite</option>{normalized.filter(c => c.id !== courseEditor?.id).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label>One-time access price<select name="unlockCost" defaultValue={String(courseEditor?.unlockCost ?? 0)}>{priceTiers.map(price => <option key={price} value={price}>{price === 0 ? "Free" : price + " credits"}</option>)}</select></label>
        <div className="modalactions"><button type="button" className="secondary" onClick={() => setCourseOpen(false)}>CANCEL</button><button className="primary">SAVE LISTING</button></div>
      </form></div>}

      {lessonOpen && current && <div className="backdrop" onMouseDown={e => {if (e.target === e.currentTarget) setLessonOpen(false);}}><form className="modal" onSubmit={e => {e.preventDefault(); saveLesson(e.currentTarget);}}>
        <div className="modalhead"><div><small>COURSE / {current.title}</small><h2>{lessonEditor ? "Edit lesson" : "Add lesson"}</h2></div><button type="button" onClick={() => setLessonOpen(false)}><X/></button></div>
        <label>Lesson title<input name="title" required maxLength={120} defaultValue={lessonEditor?.title || ""}/></label>
        <label>Short summary<textarea name="summary" defaultValue={lessonEditor?.summary || ""}/></label>
        <label>Detailed lesson content<textarea name="content" required style={{minHeight:150}} defaultValue={lessonEditor?.content || ""} placeholder="Teach the concept from fundamentals to advanced understanding."/></label>
        <label>Learning points (one per line)<textarea name="objectives" defaultValue={lessonEditor?.objectives.join("\n") || ""}/></label>
        <label>Estimated time (minutes)<input name="minutes" type="number" min="1" max="1440" defaultValue={lessonEditor?.estimatedMinutes ?? 20}/></label>
        <div className="kl-form-divider">OPTIONAL SOURCE / REFERENCE</div>
        <label>Source name<input name="source" defaultValue={lessonEditor?.resources[0]?.label || ""}/></label><label>Source URL<input name="url" type="url" defaultValue={lessonEditor?.resources[0]?.url || ""}/></label>
        <div className="kl-form-divider">OPTIONAL KNOWLEDGE CHECK · FREE TO TAKE</div>
        <label>Question<input name="question" defaultValue={lessonEditor?.question?.prompt || ""}/></label><label>Answer options (one per line)<textarea name="options" defaultValue={lessonEditor?.question?.options.join("\n") || ""}/></label><label>Correct option number (starting from 0)<input name="answerIndex" type="number" min="0" defaultValue={lessonEditor?.question?.answerIndex ?? 0}/></label><label>Explanation<textarea name="explanation" defaultValue={lessonEditor?.question?.explanation || ""}/></label>
        <div className="modalactions"><button type="button" className="secondary" onClick={() => setLessonOpen(false)}>CANCEL</button><button className="primary">SAVE LESSON</button></div>
      </form></div>}
    </div>
  );
}
