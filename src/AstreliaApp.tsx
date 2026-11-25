import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowUpRight, BookOpen, Bookmark, ChevronRight, Download, ExternalLink, FileText, Globe2, Library, LoaderCircle, Moon, Search, ShieldCheck, Sparkles, Sun, Video, X } from "lucide-react";
import KnowledgeLibrary from "./components/KnowledgeLibrary";
import VideoLearningStudio from "./components/VideoLearningStudio";
import { createUniversalKnowledgeCourses } from "./core/knowledgeCatalog";
import type { KnowledgeCourse } from "./core/knowledge";
import { ASTRELIA_STORAGE_KEY, createAstreliaBackup, normalizeAstreliaData, parseAstreliaBackup, readLegacyKnowledge, readPrototypeWorkspaces, type AstreliaData, type AstreliaReference } from "./core/astrelia";
import "./astrelia.css";

type Page = "Discover" | "Learn" | "Practice" | "Watch" | "Read" | "Library" | "Backup";
type WikiHit = { pageid: number; title: string; snippet: string };
type BookHit = { key: string; title: string; author_name?: string[]; first_publish_year?: number; edition_count?: number };
type PaperHit = { DOI?: string; title?: string[]; author?: { given?: string; family?: string }[]; published?: { "date-parts"?: number[][] }; "container-title"?: string[]; URL?: string; publisher?: string };
const nav: {id:Page;label:string;icon:typeof Search;description:string}[] = [
  {id:"Discover",label:"Discover",icon:Globe2,description:"Search the open knowledge web"},
  {id:"Learn",label:"Learn",icon:BookOpen,description:"Structured learning paths"},
  {id:"Practice",label:"Practice",icon:Activity,description:"Flashcards and practice plans"},
  {id:"Watch",label:"Watch",icon:Video,description:"Video learning studio"},
  {id:"Read",label:"Read",icon:FileText,description:"Books and research papers"},
  {id:"Library",label:"My Library",icon:Library,description:"Saved knowledge and bookmarks"},
  {id:"Backup",label:"Data & Backup",icon:ShieldCheck,description:"Export and restore your knowledge"},
];
const uid = () => globalThis.crypto?.randomUUID?.() || "ast-" + Date.now() + "-" + Math.random().toString(16).slice(2);
const starterCourses = () => createUniversalKnowledgeCourses().map(course => ({...course, unlockCost:0, unlocked:true}));
function loadInitialData(): AstreliaData {
  try {
    const raw = localStorage.getItem(ASTRELIA_STORAGE_KEY);
    if (raw) {
      const parsed = parseAstreliaBackup(JSON.parse(raw));
      if (parsed.ok) return parsed.data;
      const direct = JSON.parse(raw);
      if (direct && typeof direct === "object" && Array.isArray(direct.courses)) return normalizeAstreliaData(direct);
    }
  } catch { /* Keep the source data untouched and fall back to a safe fresh state. */ }
  let legacy = {courses:[] as Record<string,unknown>[],videos:[] as Record<string,unknown>[]};
  let prototype = {courses:[] as Record<string,unknown>[],flashcards:[] as {id:string;question:string;answer:string;createdAt:string}[],practice:[] as {id:string;text:string;done:boolean;createdAt:string}[]};
  try { legacy = readLegacyKnowledge(JSON.parse(localStorage.getItem("uls-data-v1") || "null")); } catch { /* A corrupt legacy record is never overwritten. */ }
  try { prototype = readPrototypeWorkspaces(JSON.parse(localStorage.getItem("astrelia-knowledge-v1") || "null")); } catch { /* Earlier prototype data remains untouched if it cannot be read. */ }
  return normalizeAstreliaData({courses:[...starterCourses(),...prototype.courses,...legacy.courses],videos:legacy.videos,bookmarks:[],history:[],notes:{},flashcards:prototype.flashcards,practice:prototype.practice});
}
const safeText = (value:string) => value.replace(/<[^>]*>/g," ").replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
const wikiUrl = (title:string) => "https://en.wikipedia.org/wiki/" + encodeURIComponent(title.replace(/ /g,"_"));

export default function AstreliaApp() {
  const [data,setData] = useState<AstreliaData>(loadInitialData);
  const [page,setPage] = useState<Page>("Discover");
  const [theme,setTheme] = useState<"dark"|"light">(()=>localStorage.getItem("astrelia-theme")==="light"?"light":"dark");
  const [query,setQuery] = useState("");
  const [wikiHits,setWikiHits] = useState<WikiHit[]>([]);
  const [wikiLoading,setWikiLoading] = useState(false);
  const [wikiError,setWikiError] = useState("");
  const [selectedArticle,setSelectedArticle] = useState<{title:string;extract:string;url:string}|null>(null);
  const [readQuery,setReadQuery] = useState("");
  const [books,setBooks] = useState<BookHit[]>([]);
  const [papers,setPapers] = useState<PaperHit[]>([]);
  const [readLoading,setReadLoading] = useState(false);
  const [readError,setReadError] = useState("");
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [importError,setImportError] = useState("");
  const [flashQuestion,setFlashQuestion] = useState("");
  const [flashAnswer,setFlashAnswer] = useState("");
  const [practiceDraft,setPracticeDraft] = useState("");
  const [revealedCards,setRevealedCards] = useState<Record<string,boolean>>({});
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{try{localStorage.setItem(ASTRELIA_STORAGE_KEY,JSON.stringify(data));}catch{setNotice("Browser storage is full. Export a backup before making more changes.");}},[data]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("astrelia-theme",theme);},[theme]);
  const courses = useMemo(()=>data.courses as unknown as KnowledgeCourse[],[data.courses]);
  const updateCourses = (next:KnowledgeCourse[]) => setData(old=>({...old,courses:next as unknown as Record<string,unknown>[],updatedAt:new Date().toISOString()}));
  const updateVideos = (next:unknown[]) => setData(old=>({...old,videos:next as unknown as Record<string,unknown>[],updatedAt:new Date().toISOString()}));
  const addHistory = (term:string) => setData(old=>({...old,history:[term,...old.history.filter(x=>x.toLowerCase()!==term.toLowerCase())].slice(0,100),updatedAt:new Date().toISOString()}));
  const searchKnowledge = async (term=query) => {
    const q=term.trim(); if(!q)return;
    setQuery(q);setWikiLoading(true);setWikiError("");setWikiHits([]);setSelectedArticle(null);addHistory(q);
    try{
      const url="https://en.wikipedia.org/w/api.php?"+new URLSearchParams({action:"query",list:"search",srsearch:q,srlimit:"12",format:"json",origin:"*"});
      const response=await fetch(url);if(!response.ok)throw new Error("The open encyclopedia search is temporarily unavailable.");
      const json=await response.json();const hits=(json.query?.search||[]) as WikiHit[];
      setWikiHits(hits.map(item=>({...item,snippet:safeText(item.snippet||"")})));
      if(!hits.length)setWikiError("No encyclopedia matches were returned. Try a broader phrase or different wording.");
    }catch(error){setWikiError(error instanceof Error?error.message:"Search could not be completed. Check your connection.");}
    finally{setWikiLoading(false);}
  };
  const openArticle = async (hit:WikiHit) => {
    setBusy(true);setWikiError("");
    try{
      const params=new URLSearchParams({action:"query",prop:"extracts|info",explaintext:"1",exchars:"26000",inprop:"url",redirects:"1",titles:hit.title,format:"json",origin:"*"});
      const response=await fetch("https://en.wikipedia.org/w/api.php?"+params.toString());if(!response.ok)throw new Error("The article could not be loaded.");
      const json=await response.json();const pageItem=Object.values(json.query?.pages||{})[0] as {title?:string;extract?:string;fullurl?:string}|undefined;
      if(!pageItem?.extract)throw new Error("The source did not return readable article text.");
      setSelectedArticle({title:pageItem.title||hit.title,extract:pageItem.extract.slice(0,26000),url:pageItem.fullurl||wikiUrl(hit.title)});
    }catch(error){setWikiError(error instanceof Error?error.message:"Article could not be opened.");}
    finally{setBusy(false);}
  };
  const createReadingCourse = () => {
    if(!selectedArticle)return;
    const id="open-article-"+uid();
    const now=new Date().toISOString();
    const course:KnowledgeCourse={
      id,title:selectedArticle.title+" — Open knowledge reading",created:now,subject:query||"Open knowledge",level:"Research reading",
      description:"A saved reading workspace based on a live encyclopedia article. Use the source link and further references to verify and deepen the topic.",
      objectives:["Read the source and identify its central ideas","Write a concise explanation in your own words","Check important claims against independent sources"],
      prerequisiteCourseId:"",unlockCost:0,unlocked:true,done:false,updatedAt:now,
      lessons:[{id:id+"-lesson",title:"Source article: "+selectedArticle.title,summary:"A source-based overview for further study.",content:selectedArticle.extract,objectives:["Identify the main subject and its key terms","Separate established information from claims that need further checking","Record questions for deeper research"],estimatedMinutes:30,resources:[{label:"Open original Wikipedia article",url:selectedArticle.url}],done:false}]
    };
    updateCourses([course,...courses]);setPage("Learn");setNotice("Added the source article to your learning library.");
  };
  const addBookmark = (ref:Omit<AstreliaReference,"id"|"savedAt">) => {
    setData(old=>{
      if(old.bookmarks.some(item=>item.url===ref.url))return old;
      return {...old,bookmarks:[{...ref,id:uid(),savedAt:new Date().toISOString()},...old.bookmarks],updatedAt:new Date().toISOString()};
    });
    setNotice("Saved to My Library.");
  };
  const searchReading = async () => {
    const q=readQuery.trim();if(!q)return;
    setReadLoading(true);setReadError("");setBooks([]);setPapers([]);addHistory(q);
    const bookUrl="https://openlibrary.org/search.json?"+new URLSearchParams({q,limit:"12",fields:"key,title,author_name,first_publish_year,edition_count"});
    const paperUrl="https://api.crossref.org/works?"+new URLSearchParams({query:q,rows:"12",select:"DOI,title,author,published,container-title,URL,publisher"});
    try{
      const [bookResponse,paperResponse]=await Promise.all([fetch(bookUrl),fetch(paperUrl)]);
      if(!bookResponse.ok&&!paperResponse.ok)throw new Error("Book and research indexes are temporarily unavailable.");
      if(bookResponse.ok){const json=await bookResponse.json();setBooks((json.docs||[]) as BookHit[]);}
      if(paperResponse.ok){const json=await paperResponse.json();setPapers((json.message?.items||[]) as PaperHit[]);}
    }catch(error){setReadError(error instanceof Error?error.message:"Reading search could not be completed.");}
    finally{setReadLoading(false);}
  };
  const exportBackup = () => {
    const backup=createAstreliaBackup(data);
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const anchor=document.createElement("a");
    anchor.href=url;anchor.download="astrelia-knowledge-backup-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
    setNotice("Your ASTRELIA knowledge backup has been exported.");
  };
  const importBackup = async (file?:File) => {
    if(!file)return;setImportError("");
    try{
      const parsed=parseAstreliaBackup(JSON.parse(await file.text()));
      if(!parsed.ok){setImportError(parsed.error);return;}
      if(!window.confirm("Restore this backup? Current ASTRELIA knowledge data will be replaced. Export a backup first if you want to keep it."))return;
      setData(parsed.data);setNotice("ASTRELIA backup restored successfully.");
    }catch{setImportError("This file could not be read as a valid ASTRELIA backup. Your current data has not been changed.");}
    finally{if(importRef.current)importRef.current.value="";}
  };
  const removeBookmark = (id:string) => setData(old=>({...old,bookmarks:old.bookmarks.filter(item=>item.id!==id),updatedAt:new Date().toISOString()}));
  return <div className={"astrelia-app "+(theme==="light"?"astrelia-light":"astrelia-dark")}>
    <header className="ast-header">
      <div className="ast-brand"><div className="ast-brand-mark"><Sparkles size={22}/></div><div><strong>ASTRELIA</strong><span>THE KNOWLEDGE UNIVERSE</span></div></div>
      <nav className="ast-nav" aria-label="Main navigation">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={page===item.id?"active":""} onClick={()=>setPage(item.id)} title={item.description}><Icon size={16}/><span>{item.label}</span></button>})}</nav>
      <div className="ast-header-end"><span className="ast-online"><i/> PRIVATE KNOWLEDGE SPACE</span><button className="ast-theme" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} aria-label="Toggle theme">{theme==="dark"?<Sun size={17}/>:<Moon size={17}/>}</button></div>
    </header>
    <main className="ast-main">
      {page==="Discover"&&<section className="ast-discover">
        <div className="ast-eyebrow"><Sparkles size={13}/> A UNIVERSE WITHOUT SUBJECT LIMITS</div>
        <h1>Curiosity has<br/><em>no boundaries.</em></h1>
        <p className="ast-lead">Search a subject, question, skill, concept or idea. Discover real sources, then bring what matters into your own learning universe.</p>
        <form className="ast-search" onSubmit={e=>{e.preventDefault();void searchKnowledge();}}><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="What would you like to understand?" aria-label="Search the knowledge universe"/><button disabled={!query.trim()||wikiLoading}>{wikiLoading?<LoaderCircle size={16} className="ast-spin"/>:"SEARCH UNIVERSE"} <ChevronRight size={15}/></button></form>
        <div className="ast-search-sub">OPEN KNOWLEDGE SEARCH · WIKIPEDIA ENCYCLOPEDIA INDEX · NO FIXED SUBJECT CATALOGUE</div>
        {!wikiHits.length&&!selectedArticle&&<div className="ast-discover-grid"><article><Globe2/><b>Discover</b><span>Explore any field, question or idea.</span></article><article><BookOpen/><b>Learn</b><span>Use structured lessons and knowledge checks.</span></article><article><Video/><b>Watch</b><span>Find real video lessons through YouTube.</span></article><article><FileText/><b>Read</b><span>Search books and scholarly literature.</span></article></div>}
        {wikiError&&<div className="ast-error">{wikiError}</div>}
        {wikiHits.length>0&&!selectedArticle&&<section className="ast-results"><div className="ast-section-title"><div><span className="ast-eyebrow">LIVE SOURCE RESULTS</span><h2>{query}</h2></div><span>{wikiHits.length} encyclopedia matches</span></div>{wikiHits.map(hit=><article className="ast-hit" key={hit.pageid}><div><b>{hit.title}</b><p>{hit.snippet||"Open this encyclopedia entry to read the source."}</p><small>Wikipedia · Encyclopedia reference</small></div><button onClick={()=>void openArticle(hit)} disabled={busy}>OPEN ARTICLE <ArrowUpRight size={14}/></button></article>)}</section>}
        {selectedArticle&&<section className="ast-article"><div className="ast-article-head"><div><span className="ast-eyebrow">SOURCE READER</span><h2>{selectedArticle.title}</h2><a href={selectedArticle.url} target="_blank" rel="noreferrer">Open original source <ExternalLink size={12}/></a></div><button className="ast-quiet" onClick={()=>setSelectedArticle(null)}><X size={16}/> Close</button></div><div className="ast-article-text">{selectedArticle.extract}</div><div className="ast-article-actions"><button className="ast-primary" onClick={createReadingCourse}><BookOpen size={15}/> ADD TO LEARNING LIBRARY</button><button className="ast-secondary" onClick={()=>addBookmark({title:selectedArticle.title,url:selectedArticle.url,kind:"article",source:"Wikipedia",description:selectedArticle.extract.slice(0,350)})}><Bookmark size={15}/> SAVE SOURCE</button></div></section>}
        {busy&&<div className="ast-loading"><LoaderCircle className="ast-spin"/> Loading source article…</div>}
        {!wikiHits.length&&!selectedArticle&&<div className="ast-popular"><span>POPULAR STARTING POINTS</span>{["Vectors and 3D geometry","Artificial intelligence","Human psychology","Personal finance","Astronomy","World history","Biology","Entrepreneurship"].map(term=><button key={term} onClick={()=>{setQuery(term);void searchKnowledge(term);}}>{term}<ChevronRight size={13}/></button>)}</div>}
      </section>}
      {page==="Learn"&&<section className="ast-page"><div className="ast-page-heading"><span className="ast-eyebrow">YOUR LEARNING UNIVERSE</span><h1>Learn without limits.</h1><p>Explore complete ready-made pathways, open your saved source readings and check your understanding as you progress.</p></div><KnowledgeLibrary courses={courses} credits={0} onChange={updateCourses} onEconomy={(next)=>updateCourses(next)}/></section>}
      {page==="Watch"&&<section className="ast-page"><div className="ast-page-heading"><span className="ast-eyebrow">VIDEO LEARNING STUDIO</span><h1>Watch. Understand. Apply.</h1><p>Discover up to 50 relevant YouTube lessons in English or Hindi, save videos, play supported links and organise your video learning.</p></div><VideoLearningStudio videos={data.videos} courses={courses} onChange={updateVideos} onOpenKnowledge={()=>setPage("Learn")}/></section>}
      {page==="Read"&&<section className="ast-page"><div className="ast-page-heading"><span className="ast-eyebrow">THE READING ROOM</span><h1>Go deeper through reading.</h1><p>Search books and scholarly publications. Save useful references to your personal library.</p></div><form className="ast-read-search" onSubmit={e=>{e.preventDefault();void searchReading();}}><Search size={19}/><input value={readQuery} onChange={e=>setReadQuery(e.target.value)} placeholder="Search a book, author, subject or research question"/><button disabled={!readQuery.trim()||readLoading}>{readLoading?<LoaderCircle size={15} className="ast-spin"/>:"SEARCH BOOKS & PAPERS"}</button></form>{readError&&<div className="ast-error">{readError}</div>}{readLoading&&<div className="ast-loading"><LoaderCircle className="ast-spin"/> Searching open reading indexes…</div>}
        <div className="ast-reading-columns"><section><div className="ast-section-title"><div><span className="ast-eyebrow">OPEN LIBRARY</span><h2>Books</h2></div><span>{books.length} results</span></div>{books.map((book,i)=>{const url="https://openlibrary.org"+book.key;return <article className="ast-read-card" key={book.key||i}><div><b>{book.title}</b><p>{(book.author_name||["Author not listed"]).slice(0,3).join(", ")}{book.first_publish_year?" · "+book.first_publish_year:""}</p><small>{book.edition_count||0} indexed editions</small></div><div><button onClick={()=>addBookmark({title:book.title,url,kind:"book",source:"Open Library",description:(book.author_name||[]).join(", ")})}><Bookmark size={14}/></button><a href={url} target="_blank" rel="noreferrer"><ExternalLink size={14}/></a></div></article>})}{!books.length&&!readLoading&&<p className="ast-muted">Search to discover books from Open Library.</p>}</section>
        <section><div className="ast-section-title"><div><span className="ast-eyebrow">CROSSREF</span><h2>Research papers</h2></div><span>{papers.length} results</span></div>{papers.map((paper,i)=>{const title=paper.title?.[0]||"Untitled research";const url=paper.URL||(paper.DOI?"https://doi.org/"+paper.DOI:"https://search.crossref.org/?q="+encodeURIComponent(title));const author=(paper.author||[]).slice(0,3).map(a=>[a.given,a.family].filter(Boolean).join(" ")).join(", ");const year=paper.published?.["date-parts"]?.[0]?.[0];return <article className="ast-read-card" key={paper.DOI||i}><div><b>{title}</b><p>{author||paper.publisher||"Author not listed"}{year?" · "+year:""}</p><small>{paper["container-title"]?.[0]||paper.publisher||"Research publication"}{paper.DOI?" · DOI "+paper.DOI:""}</small></div><div><button onClick={()=>addBookmark({title,url,kind:"paper",source:"Crossref",description:author})}><Bookmark size={14}/></button><a href={url} target="_blank" rel="noreferrer"><ExternalLink size={14}/></a></div></article>})}{!papers.length&&!readLoading&&<p className="ast-muted">Search to discover scholarly works from Crossref.</p>}</section></div>
      </section>}
      {page==="Library"&&<section className="ast-page"><div className="ast-page-heading"><span className="ast-eyebrow">YOUR PERSONAL KNOWLEDGE MEMORY</span><h1>What you save, stays yours.</h1><p>Keep sources, revisit your searches and write personal notes alongside saved references.</p></div>
        <div className="ast-library-stats"><article><b>{data.bookmarks.length}</b><span>SAVED SOURCES</span></article><article><b>{data.courses.length}</b><span>LEARNING PATHS</span></article><article><b>{data.history.length}</b><span>RECENT SEARCHES</span></article></div>
        <div className="ast-library-grid"><section><div className="ast-section-title"><div><span className="ast-eyebrow">BOOKMARKS</span><h2>Saved references</h2></div></div>{data.bookmarks.length?data.bookmarks.map(item=><article className="ast-bookmark" key={item.id}><div><span>{item.kind.toUpperCase()} · {item.source}</span><b>{item.title}</b><p>{item.description}</p><a href={item.url} target="_blank" rel="noreferrer">OPEN SOURCE <ExternalLink size={12}/></a><textarea value={data.notes[item.id]||""} onChange={e=>setData(old=>({...old,notes:{...old.notes,[item.id]:e.target.value}}))} placeholder="Your private notes about this resource…"/></div><button className="ast-remove" onClick={()=>removeBookmark(item.id)} aria-label="Remove bookmark"><X size={15}/></button></article>):<p className="ast-muted">Save books, papers and articles to build your personal reference library.</p>}</section>
        <section><div className="ast-section-title"><div><span className="ast-eyebrow">SEARCH HISTORY</span><h2>Recently explored</h2></div><button className="ast-quiet" onClick={()=>setData(old=>({...old,history:[]}))}>CLEAR HISTORY</button></div>{data.history.map(term=><button className="ast-history" key={term} onClick={()=>{setQuery(term);setPage("Discover");void searchKnowledge(term);}}><Search size={14}/>{term}<ChevronRight size={14}/></button>)}</section></div>
      </section>}
      {page==="Backup"&&<section className="ast-page ast-backup"><div className="ast-page-heading"><span className="ast-eyebrow">YOUR KNOWLEDGE BELONGS TO YOU</span><h1>Protect your universe.</h1><p>Export a portable copy of your courses, videos, bookmarks, notes and search history. Restore it whenever you need.</p></div>
        <div className="ast-backup-card"><div className="ast-backup-icon"><Download size={23}/></div><div><h2>Export knowledge backup</h2><p>Create a versioned JSON backup containing your ASTRELIA Release 1 data.</p><button className="ast-primary" onClick={exportBackup}><Download size={15}/> EXPORT BACKUP</button></div></div>
        <div className="ast-backup-card"><div className="ast-backup-icon"><ShieldCheck size={23}/></div><div><h2>Restore from backup</h2><p>Restore a previously exported ASTRELIA JSON file. The app validates it before changing your current data.</p><button className="ast-secondary" onClick={()=>importRef.current?.click()}>CHOOSE BACKUP FILE</button><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={e=>void importBackup(e.target.files?.[0])}/>{importError&&<p className="ast-error">{importError}</p>}</div></div>
        <div className="ast-privacy"><ShieldCheck size={18}/><div><b>Local-first data storage</b><p>Your learning data is stored in this browser. It does not automatically sync to other devices. Keep exported backups somewhere safe. The original ULS/ARVENA storage key is read-only during initial import and is not erased.</p></div></div>
      </section>}
      {notice&&<div className="ast-notice" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
    </main>
    <footer className="ast-footer">ASTRELIA <span>·</span> KNOWLEDGE IS A UNIVERSE <span>·</span> YOUR JOURNEY, YOUR MEMORY</footer>
  </div>;
}
