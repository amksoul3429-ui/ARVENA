import { useEffect, useMemo, useState } from "react";
import { BookOpen, Compass, Search, PlayCircle, FileText, Brain, Dumbbell, Plus, Trash2, Bookmark, Clock3, ExternalLink, Moon, Sun, ChevronRight, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import "./KnowledgeUniverse.css";

type Mode = "Learn" | "Explore" | "Watch" | "Read" | "Test" | "Practice";
type Flashcard = { id: string; question: string; answer: string };
type PracticeItem = { id: string; text: string; done: boolean };
type Workspace = {
  id: string; topic: string; createdAt: string; updatedAt: string;
  notes: string; completedLessons: string[]; cards: Flashcard[]; practice: PracticeItem[];
  bookmarks: string[]; lastMode: Mode;
};
const STORE = "astrelia-knowledge-v1";
const modes: { id: Mode; icon: typeof BookOpen; hint: string }[] = [
  { id: "Learn", icon: BookOpen, hint: "Build understanding step by step" },
  { id: "Explore", icon: Compass, hint: "Discover connected ideas" },
  { id: "Watch", icon: PlayCircle, hint: "Find video lessons" },
  { id: "Read", icon: FileText, hint: "Find books and written sources" },
  { id: "Test", icon: Brain, hint: "Check what you remember" },
  { id: "Practice", icon: Dumbbell, hint: "Apply what you have learned" },
];
const lessonStages = [
  ["Orientation", "What is this topic? Define its scope, purpose and the questions it answers."],
  ["Foundations", "Identify the essential vocabulary, prerequisite ideas and basic principles."],
  ["Core ideas", "Break the subject into its central concepts. Explain how each idea works and why it matters."],
  ["Worked examples", "Study concrete examples, then explain each step in your own words."],
  ["Connections", "Connect this topic to neighbouring concepts, real-world applications and other fields."],
  ["Advanced understanding", "Investigate edge cases, deeper theory, limitations and open questions."],
  ["Mastery review", "Summarise the subject, retrieve key ideas from memory and identify remaining gaps."],
];
const uid = () => globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);
const safeLoad = (): Workspace[] => {
  try { const raw = localStorage.getItem(STORE); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed.filter(x => x && typeof x.id === "string" && typeof x.topic === "string") : []; }
  catch { return []; }
};
const makeWorkspace = (topic: string): Workspace => ({ id: uid(), topic: topic.trim(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), notes: "", completedLessons: [], cards: [], practice: [], bookmarks: [], lastMode: "Learn" });
const enc = (s: string) => encodeURIComponent(s.trim());
function resourceLinks(topic: string) {
  const q = enc(topic);
  return {
    wiki: "https://en.wikipedia.org/w/index.php?search=" + q,
    google: "https://www.google.com/search?q=" + q,
    youtube: "https://www.youtube.com/results?search_query=" + q + "+lecture",
    books: "https://books.google.com/books?q=" + q,
    scholar: "https://scholar.google.com/scholar?q=" + q,
    openlibrary: "https://openlibrary.org/search?q=" + q,
  };
}
function relatedTerms(topic: string) {
  const clean = topic.trim().replace(/[?!.]+$/, "");
  return ["Introduction to " + clean, clean + " fundamentals", "Applications of " + clean, "Advanced " + clean, clean + " examples and problems", clean + " in real life"];
}
export default function KnowledgeUniverse() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(safeLoad);
  const [activeId, setActiveId] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("Learn");
  const [light, setLight] = useState(() => localStorage.getItem("astrelia-theme") === "light");
  const [cardQ, setCardQ] = useState("");
  const [cardA, setCardA] = useState("");
  const [practiceDraft, setPracticeDraft] = useState("");
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const active = workspaces.find(w => w.id === activeId) || null;
  const links = useMemo(() => active ? resourceLinks(active.topic) : null, [active?.topic]);
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(workspaces)); } catch { setNotice("Storage is full. Export or remove old browser data before continuing."); } }, [workspaces]);
  useEffect(() => { document.documentElement.dataset.theme = light ? "light" : "dark"; localStorage.setItem("astrelia-theme", light ? "light" : "dark"); }, [light]);
  useEffect(() => { setNotesDraft(active?.notes || ""); if (active) setMode(active.lastMode || "Learn"); }, [activeId]);
  const update = (patch: Partial<Workspace>) => setWorkspaces(old => old.map(w => w.id === activeId ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w));
  const searchTopic = (value = query) => {
    const topic = value.trim(); if (!topic) return;
    const existing = workspaces.find(w => w.topic.toLowerCase() === topic.toLowerCase());
    if (existing) { setActiveId(existing.id); setQuery(""); setNotice("Opened your saved learning space."); return; }
    const next = makeWorkspace(topic); setWorkspaces(old => [next, ...old]); setActiveId(next.id); setMode("Learn"); setQuery(""); setNotice("Learning space created. Choose a mode to begin.");
  };
  const switchMode = (next: Mode) => { setMode(next); if (active) update({ lastMode: next }); };
  const saveNotes = () => { update({ notes: notesDraft }); setNotice("Your notes are saved on this device."); };
  const toggleLesson = (id: string) => update({ completedLessons: active!.completedLessons.includes(id) ? active!.completedLessons.filter(x => x !== id) : [...active!.completedLessons, id] });
  const addCard = () => { if (!cardQ.trim() || !cardA.trim() || !active) return; update({ cards: [...active.cards, { id: uid(), question: cardQ.trim(), answer: cardA.trim() }] }); setCardQ(""); setCardA(""); };
  const addPractice = () => { if (!practiceDraft.trim() || !active) return; update({ practice: [...active.practice, { id: uid(), text: practiceDraft.trim(), done: false }] }); setPracticeDraft(""); };
  const removeWorkspace = (id: string) => { if (!confirm("Delete this learning space and its saved notes? This cannot be undone.")) return; setWorkspaces(old => old.filter(w => w.id !== id)); if (activeId === id) setActiveId(""); };
  const progress = active ? Math.round(active.completedLessons.length / lessonStages.length * 100) : 0;
  return <div className={"ku-root " + (light ? "ku-light" : "ku-dark")}>
    <header className="ku-header"><div className="ku-brand"><div className="ku-mark"><Sparkles size={21}/></div><div><strong>ASTRELIA</strong><span>THE KNOWLEDGE UNIVERSE</span></div></div><div className="ku-header-actions"><span className="ku-status"><i/> YOUR PRIVATE LEARNING SPACE</span><button className="ku-icon-btn" onClick={() => setLight(v => !v)} aria-label="Toggle theme">{light ? <Moon size={18}/> : <Sun size={18}/>}</button></div></header>
    <main className="ku-main">
      {!active ? <section className="ku-home">
        <div className="ku-eyebrow"><Sparkles size={14}/> A UNIVERSE WITHOUT SUBJECT LIMITS</div>
        <h1>Curiosity has<br/><em>no boundaries.</em></h1>
        <p className="ku-intro">Search anything you want to understand. Create a space to learn, explore, watch, read, test and practise — all connected to your own knowledge library.</p>
        <form className="ku-search" onSubmit={e => { e.preventDefault(); searchTopic(); }}><Search size={21}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="What would you like to learn today?" aria-label="Search any topic"/><button type="submit">EXPLORE <ChevronRight size={16}/></button></form>
        <div className="ku-search-note">No fixed catalogue. Enter a subject, question, skill, concept or idea.</div>
        <div className="ku-mode-preview">{modes.map(m => <div className="ku-mode-tile" key={m.id}><m.icon size={19}/><b>{m.id}</b><span>{m.hint}</span></div>)}</div>
        {workspaces.length > 0 && <section className="ku-recent"><div className="ku-section-head"><div><span className="ku-eyebrow">YOUR PERSONAL ARCHIVE</span><h2>Continue exploring</h2></div><span>{workspaces.length} SAVED {workspaces.length === 1 ? "SPACE" : "SPACES"}</span></div><div className="ku-workspace-grid">{workspaces.map(w => <article className="ku-workspace-card" key={w.id}><button className="ku-card-open" onClick={() => setActiveId(w.id)}><span className="ku-card-kicker">LEARNING SPACE</span><b>{w.topic}</b><small>{w.completedLessons.length}/{lessonStages.length} learning stages · Updated {new Date(w.updatedAt).toLocaleDateString()}</small><span className="ku-card-link">CONTINUE <ChevronRight size={14}/></span></button><button className="ku-delete" onClick={() => removeWorkspace(w.id)} aria-label={"Delete " + w.topic}><Trash2 size={14}/></button></article>)}</div></section>}
      </section> : <>
        <div className="ku-breadcrumb"><button onClick={() => setActiveId("")}><ArrowLeft size={15}/> ALL KNOWLEDGE</button><span>/</span><span>LEARNING SPACE</span></div>
        <section className="ku-topic-heading"><div><div className="ku-eyebrow"><Sparkles size={13}/> YOUR SUBJECT WORKSPACE</div><h1>{active.topic}</h1><p>One topic. Multiple ways to understand it. Your progress stays with you.</p></div><div className="ku-progress"><div><strong>{progress}%</strong><span>LEARNING PATH</span></div><div className="ku-progress-track"><i style={{width: progress + "%"}}/></div></div></section>
        <nav className="ku-tabs" aria-label="Learning modes">{modes.map(m => <button key={m.id} className={mode === m.id ? "selected" : ""} onClick={() => switchMode(m.id)}><m.icon size={17}/><span>{m.id}</span></button>)}</nav>
        <section className="ku-panel">
          {mode === "Learn" && <div className="ku-learn"><div className="ku-panel-title"><div><span className="ku-eyebrow">STRUCTURED LEARNING PATH</span><h2>From first principles to mastery</h2><p>This is your editable learning roadmap. Use the linked research sources to verify facts and expand each stage with your own notes.</p></div><span className="ku-pill">7 STAGES</span></div><div className="ku-stage-list">{lessonStages.map(([title, desc], i) => { const done = active.completedLessons.includes(String(i)); return <article className={"ku-stage " + (done ? "done" : "")} key={title}><button onClick={() => toggleLesson(String(i))} className="ku-stage-check" aria-label={done ? "Mark incomplete" : "Mark complete"}>{done ? <CheckCircle2 size={19}/> : <span>{String(i + 1).padStart(2, "0")}</span>}</button><div><b>{title}</b><p>{desc}</p></div><span className="ku-stage-state">{done ? "COMPLETED" : "NOT STARTED"}</span></article>; })}</div><div className="ku-notes"><div className="ku-section-head"><div><span className="ku-eyebrow">KNOWLEDGE MEMORY</span><h3>Your learning notes</h3></div><button className="ku-secondary" onClick={saveNotes}><Bookmark size={14}/> SAVE NOTES</button></div><textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} placeholder={"Write explanations, definitions, examples and questions about " + active.topic + "..."} rows={8}/></div></div>}
          {mode === "Explore" && <div><span className="ku-eyebrow">DISCOVERY MAP</span><h2>Explore {active.topic}</h2><p className="ku-muted">These are suggested directions for your research, not claims that have already been verified.</p><div className="ku-discovery-grid">{relatedTerms(active.topic).map((term, i) => <button key={term} onClick={() => searchTopic(term)}><span>0{i+1}</span><b>{term}</b><ChevronRight size={16}/></button>)}</div><div className="ku-link-grid"><a href={links!.scholar} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Academic research search</a><a href={links!.wiki} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Encyclopaedia discovery</a><a href={links!.google} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Broader web research</a></div></div>}
          {mode === "Watch" && <div><span className="ku-eyebrow">VIDEO LEARNING</span><h2>Watch and learn</h2><p className="ku-muted">Open a live YouTube search for this topic. Results are provided by YouTube; ASTRELIA does not invent rankings or video details.</p><a className="ku-feature-link" href={links!.youtube} target="_blank" rel="noreferrer"><PlayCircle size={22}/><span><b>Search YouTube for {active.topic}</b><small>Find lectures, explainers and tutorials</small></span><ExternalLink size={17}/></a><div className="ku-note-callout">Video discovery currently opens YouTube directly. In-app ranked results and playback require a verified YouTube/API integration and are not represented as complete yet.</div></div>}
          {mode === "Read" && <div><span className="ku-eyebrow">READING ROOM</span><h2>Find reliable written material</h2><p className="ku-muted">Search books, scholarly literature and reference articles for this topic.</p><div className="ku-link-grid ku-reading-links"><a href={links!.books} target="_blank" rel="noreferrer"><BookOpen size={18}/> Google Books</a><a href={links!.openlibrary} target="_blank" rel="noreferrer"><BookOpen size={18}/> Open Library</a><a href={links!.scholar} target="_blank" rel="noreferrer"><FileText size={18}/> Google Scholar</a><a href={links!.wiki} target="_blank" rel="noreferrer"><FileText size={18}/> Wikipedia search</a></div></div>}
          {mode === "Test" && <div><span className="ku-eyebrow">ACTIVE RECALL</span><h2>Test what you remember</h2><p className="ku-muted">Create your own question-and-answer cards from what you have studied, then reveal answers to practise retrieval.</p><div className="ku-card-builder"><input value={cardQ} onChange={e => setCardQ(e.target.value)} placeholder="Question or concept"/><textarea value={cardA} onChange={e => setCardA(e.target.value)} placeholder="Answer in your own words" rows={3}/><button className="ku-primary" onClick={addCard}><Plus size={15}/> ADD FLASHCARD</button></div><div className="ku-flashcards">{active.cards.map((card, i) => <article key={card.id}><span>CARD {String(i+1).padStart(2,"0")}</span><b>{card.question}</b>{showAnswer[card.id] && <p>{card.answer}</p>}<div><button className="ku-secondary" onClick={() => setShowAnswer(s => ({...s,[card.id]:!s[card.id]}))}>{showAnswer[card.id] ? "HIDE ANSWER" : "REVEAL ANSWER"}</button><button className="ku-delete" onClick={() => update({cards:active.cards.filter(c => c.id !== card.id)})}><Trash2 size={14}/></button></div></article>)}</div>{active.cards.length === 0 && <div className="ku-empty">Your flashcards will appear here.</div>}</div>}
          {mode === "Practice" && <div><span className="ku-eyebrow">LEARNING BY DOING</span><h2>Turn understanding into ability</h2><p className="ku-muted">Add exercises, examples, projects or real-world tasks. Tick them off as you complete them.</p><form className="ku-practice-add" onSubmit={e => {e.preventDefault();addPractice();}}><input value={practiceDraft} onChange={e => setPracticeDraft(e.target.value)} placeholder="Add an exercise or practical task"/><button className="ku-primary"><Plus size={15}/> ADD</button></form><div className="ku-practice-list">{active.practice.map(item => <label key={item.id} className={item.done ? "done" : ""}><input type="checkbox" checked={item.done} onChange={() => update({practice:active.practice.map(p => p.id === item.id ? {...p,done:!p.done} : p)})}/><span>{item.text}</span><button type="button" onClick={() => update({practice:active.practice.filter(p => p.id !== item.id)})} aria-label="Remove practice task"><Trash2 size={14}/></button></label>)}</div>{active.practice.length === 0 && <div className="ku-empty">Your practice plan starts with one small exercise.</div>}</div>}
        </section>
        <div className="ku-topic-footer"><span><Clock3 size={14}/> SAVED LOCALLY ON THIS DEVICE</span><button onClick={() => removeWorkspace(active.id)}><Trash2 size={14}/> DELETE LEARNING SPACE</button></div>
      </>}
      {notice && <div className="ku-notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    </main>
    <footer className="ku-footer">ASTRELIA <span>·</span> KNOWLEDGE IS A UNIVERSE <span>·</span> YOUR JOURNEY, YOUR MEMORY</footer>
  </div>;
}
