import { useState } from "react";
import { BookOpen, BrainCircuit, CheckCircle2, Eye, EyeOff, GraduationCap, LoaderCircle, MessageCircle, Plus, Save, Settings2, Sparkles } from "lucide-react";
import { AI_MODELS, AI_TEACHER_SETTINGS_KEY, DEFAULT_AI_MODEL, askAITutor, generateAICourse, testAITeacherConnection, type AICourse, type AITeacherSettings } from "../core/aiTeacher";
import "./AITeacher.css";

type Props = { onCreateCourse:(course:AICourse)=>void; };
const readSettings=():AITeacherSettings=>{try{const v=JSON.parse(localStorage.getItem(AI_TEACHER_SETTINGS_KEY)||"{}");return {apiKey:typeof v.apiKey==="string"?v.apiKey:"",model:AI_MODELS.includes(v.model)?v.model:DEFAULT_AI_MODEL};}catch{return {apiKey:"",model:DEFAULT_AI_MODEL};}};
export default function AITeacher({onCreateCourse}:Props){
 const [settings,setSettings]=useState<AITeacherSettings>(readSettings);
 const [showKey,setShowKey]=useState(false);
 const [showSettings,setShowSettings]=useState(!readSettings().apiKey);
 const [topic,setTopic]=useState("");
 const [level,setLevel]=useState("Beginner to advanced");
 const [language,setLanguage]=useState("English");
 const [goal,setGoal]=useState("Deep understanding");
 const [course,setCourse]=useState<AICourse|null>(null);
 const [busy,setBusy]=useState(false);
 const [testing,setTesting]=useState(false);
 const [status,setStatus]=useState("");
 const [error,setError]=useState("");
 const [question,setQuestion]=useState("");
 const [answer,setAnswer]=useState("");
 const [asking,setAsking]=useState(false);
 const saveSettings=()=>{localStorage.setItem(AI_TEACHER_SETTINGS_KEY,JSON.stringify(settings));setStatus("Settings saved in this browser. The API key is not included in ASTRELIA backups.");setError("");};
 const testConnection=async()=>{setTesting(true);setStatus("");setError("");try{localStorage.setItem(AI_TEACHER_SETTINGS_KEY,JSON.stringify(settings));setStatus(await testAITeacherConnection(settings));}catch(e){setError(e instanceof Error?e.message:"Connection test failed.");}finally{setTesting(false);}};
 const create=async()=>{if(!topic.trim())return;setBusy(true);setError("");setStatus("");setCourse(null);try{const generated=await generateAICourse(settings,topic.trim(),level,language,goal);setCourse(generated);setStatus("Your topic-specific course has been generated. Review it, then add it to Learn.");}catch(e){setError(e instanceof Error?e.message:"Course generation failed.");}finally{setBusy(false);}};
 const ask=async()=>{if(!question.trim())return;setAsking(true);setError("");setAnswer("");try{setAnswer(await askAITutor(settings,topic.trim()||"General knowledge",question,course?course.lessons.map(l=>l.title+": "+l.content.slice(0,1200)).join("\n\n"):""));}catch(e){setError(e instanceof Error?e.message:"The tutor could not answer.");}finally{setAsking(false);}};
 return <div className="ast-ai-teacher">
  <div className="ast-ai-hero"><div className="ast-ai-orb"><BrainCircuit size={28}/></div><div><span className="ast-eyebrow">ASTRELIA INTELLIGENCE · UNIVERSAL TEACHER</span><h2>Learn anything. Go beyond the basics.</h2><p>Generate a structured course for a topic you choose, then ask a tutor to explain difficult ideas in context.</p></div><button className="ast-ai-settings-toggle" onClick={()=>setShowSettings(v=>!v)}><Settings2 size={15}/>{showSettings?"HIDE SETTINGS":"AI SETTINGS"}</button></div>
  {showSettings&&<section className="ast-ai-settings"><div className="ast-ai-settings-head"><div><b>Connect Gemini AI</b><p>Use your own Google AI Studio key. A free tier is available for eligible models, subject to Google's quotas and terms.</p></div><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">GET API KEY ↗</a></div>
   <label>Gemini API key<div className="ast-ai-key"><input type={showKey?"text":"password"} value={settings.apiKey} onChange={e=>setSettings(s=>({...s,apiKey:e.target.value}))} placeholder="Paste your Gemini API key"/><button type="button" onClick={()=>setShowKey(v=>!v)} aria-label="Show or hide API key">{showKey?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
   <label>Model<select value={settings.model} onChange={e=>setSettings(s=>({...s,model:e.target.value}))}>{AI_MODELS.map(m=><option key={m} value={m}>{m}</option>)}</select></label>
   <div className="ast-ai-setting-actions"><button className="ast-secondary" onClick={saveSettings}><Save size={14}/> SAVE SETTINGS</button><button className="ast-primary" disabled={!settings.apiKey.trim()||testing} onClick={()=>void testConnection()}>{testing?<LoaderCircle size={14} className="ast-spin"/>:<CheckCircle2 size={14}/>} TEST CONNECTION</button></div>
   <p className="ast-ai-privacy">Privacy: the key is stored in this browser's local storage and sent directly to Google when you use AI. It is not encrypted and is not included in ASTRELIA exports. Do not use a key with billing enabled unless you understand the possible charges. Google's free-tier content-use terms apply.</p>
  </section>}
  <section className="ast-ai-create"><div className="ast-ai-section-title"><span className="ast-eyebrow">01 · CREATE A LEARNING PATH</span><h3>What do you want to master?</h3><p>Enter any subject, question, skill or specialised topic. There is no fixed catalogue.</p></div>
   <form onSubmit={e=>{e.preventDefault();void create();}}>
    <label>Topic or subject<input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Vector algebra, quantum mechanics, financial modelling, Japanese…"/></label>
    <div className="ast-ai-fields"><label>Starting level<select value={level} onChange={e=>setLevel(e.target.value)}><option>Beginner to advanced</option><option>Complete beginner</option><option>Intermediate</option><option>Advanced</option><option>Exam preparation</option><option>Practical professional skill</option></select></label><label>Teaching language<select value={language} onChange={e=>setLanguage(e.target.value)}><option>English</option><option>Hindi</option><option>English with Hindi explanations</option></select></label><label>Learning goal<select value={goal} onChange={e=>setGoal(e.target.value)}><option>Deep understanding</option><option>Exam preparation</option><option>Practical application</option><option>Research and advanced study</option><option>Career-ready skill</option></select></label></div>
    <button className="ast-primary ast-ai-generate" disabled={!topic.trim()||busy||!settings.apiKey.trim()}>{busy?<><LoaderCircle size={16} className="ast-spin"/> BUILDING YOUR COURSE…</>:<><Sparkles size={16}/> GENERATE COMPLETE COURSE</>}</button>
    {!settings.apiKey.trim()&&<small className="ast-ai-hint">Connect a Gemini API key above to activate course generation.</small>}
   </form>
  </section>
  {error&&<div className="ast-ai-error">{error}</div>}{status&&<div className="ast-ai-status">{status}</div>}
  {course&&<section className="ast-ai-preview"><div className="ast-ai-section-title"><span className="ast-eyebrow">GENERATED CURRICULUM · {course.lessons.length} LESSONS</span><h3>{course.title}</h3><p>{course.description}</p></div><div className="ast-ai-objectives"><b>Learning outcomes</b>{course.objectives.map((x,i)=><span key={i}>✓ {x}</span>)}</div><div className="ast-ai-lesson-list">{course.lessons.map((lesson,i)=><article key={lesson.id}><span>LESSON {String(i+1).padStart(2,"0")} · {lesson.estimatedMinutes} MIN</span><b>{lesson.title}</b><p>{lesson.summary}</p></article>)}</div><button className="ast-primary" onClick={()=>{onCreateCourse(course);setCourse(null);setStatus("Course saved to Learn. Your progress will be stored in this browser.");}}><Plus size={15}/> ADD COURSE TO MY LEARNING LIBRARY</button><p className="ast-ai-disclaimer">AI-generated educational material can contain errors. Verify high-stakes or exam-critical facts with trusted textbooks and independent sources.</p></section>}
  <section className="ast-ai-tutor"><div className="ast-ai-section-title"><span className="ast-eyebrow">02 · ASK YOUR TUTOR</span><h3>What is difficult to understand?</h3><p>Ask follow-up questions. When a course has been generated above, the tutor can use its lesson context.</p></div><form onSubmit={e=>{e.preventDefault();void ask();}}><textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={3} placeholder="Explain this concept step by step…"/><button className="ast-secondary" disabled={!question.trim()||asking||!settings.apiKey.trim()}>{asking?<LoaderCircle size={14} className="ast-spin"/>:<MessageCircle size={14}/>} ASK ASTRELIA TUTOR</button></form>{answer&&<article className="ast-ai-answer"><b>ASTRELIA TUTOR</b><div>{answer}</div></article>}</section>
 </div>;
}
