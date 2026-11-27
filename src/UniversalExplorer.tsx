import {useState} from 'react';
import './universal-explorer.css';
import {Globe2,Search,ExternalLink,PlayCircle,Video,BookOpen,LoaderCircle,ArrowUpRight,Orbit,GraduationCap} from 'lucide-react';

type Article={title:string;snippet:string;url:string};
type VideoItem={id:string;url:string;title:string;provider:string};
function videoEmbed(raw:string):{embed:string;provider:string}|null{
 try{
  const u=new URL(raw);
  if(u.hostname==='youtu.be'||u.hostname.endsWith('youtube.com')){
   const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.match(/\/embed\/([^/?]+)/)?.[1]||u.pathname.match(/\/shorts\/([^/?]+)/)?.[1];
   return id?{embed:'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id),provider:'YouTube'}:null;
  }
  if(u.hostname.endsWith('vimeo.com')){
   const id=u.pathname.split('/').filter(Boolean).pop();
   return id&&/^\d+$/.test(id)?{embed:'https://player.vimeo.com/video/'+id,provider:'Vimeo'}:null;
  }
 }catch{}
 return null;
}
type Props={videos:VideoItem[];onChange:(videos:VideoItem[])=>void};
export default function UniversalExplorer({videos,onChange}:Props){
 const [query,setQuery]=useState('');
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [results,setResults]=useState<Article[]>([]);
 const [searched,setSearched]=useState('');
 const [videoUrl,setVideoUrl]=useState('');
 const [videoTitle,setVideoTitle]=useState('');
 const [active,setActive]=useState<VideoItem|null>(null);
 const [tab,setTab]=useState<'discover'|'videos'>('discover');
 const search=async(term=query)=>{
  const q=term.trim();if(!q)return;
  setQuery(q);setSearched(q);setLoading(true);setError('');setResults([]);
  try{
   const endpoint='https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(q)+'&srlimit=8&format=json&origin=*';
   const response=await fetch(endpoint);if(!response.ok)throw new Error('Knowledge source is temporarily unavailable.');
   const data=await response.json();
   const items=(data.query?.search||[]) as {title:string;snippet:string}[];
   setResults(items.map(x=>({title:x.title,snippet:x.snippet.replace(/<[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&#039;/g,"'"),url:'https://en.wikipedia.org/wiki/'+encodeURIComponent(x.title.replace(/ /g,'_'))})));
   if(!items.length)setError('No matching encyclopedia entries were returned. Try a broader term or a different phrase.');
  }catch(e){setError(e instanceof Error?e.message:'Search failed. Check your connection and try again.');}
  finally{setLoading(false);}
 };
 const addVideo=()=>{
  const parsed=videoEmbed(videoUrl);if(!parsed)return;
  const item={id:parsed.embed,title:videoTitle.trim()||'Saved educational video',url:videoUrl.trim(),provider:parsed.provider};
  const next=[item,...videos.filter(v=>v.id!==item.id)];onChange(next);setActive(item);setVideoUrl('');setVideoTitle('');
 };
 const removeVideo=(id:string)=>{const next=videos.filter(v=>v.id!==id);onChange(next);if(active?.id===id)setActive(null);};
 const topics=['Astronomy','Cosmology','Evolution','Quantum mechanics','Mathematics','Computer science','Artificial intelligence','World history','Philosophy','Psychology','Economics','Medicine','Earth science','Literature','Languages','Engineering','Music theory','Ecology','Political science','Art history','Neuroscience','Oceanography','Geology','Ethics'];
 return <section className="ux">
  <div className="ux-heading"><div><span><Orbit size={13}/> UNIVERSAL KNOWLEDGE EXPLORER</span><h2>Explore the <em>known and unknown.</em></h2><p>Search across disciplines and discover connected ideas. Your starting point is not limited to a preset course catalogue.</p></div><div className="ux-mark"><Globe2 size={36}/><small>OPEN KNOWLEDGE</small></div></div>
  <div className="ux-tabs"><button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')}><Search size={14}/> DISCOVER KNOWLEDGE</button><button className={tab==='videos'?'active':''} onClick={()=>setTab('videos')}><Video size={14}/> VIDEO LIBRARY <b>{videos.length}</b></button></div>
  {tab==='discover'?<>
   <form className="ux-search" onSubmit={e=>{e.preventDefault();search()}}><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ask about anything in the world or universe..."/><button disabled={!query.trim()||loading}>{loading?<LoaderCircle className="ux-spin" size={16}/>: 'EXPLORE'}</button></form>
   <div className="ux-topic-label">START EXPLORING · SELECT ANY FIELD</div><div className="ux-topics">{topics.map(t=><button key={t} onClick={()=>search(t)}>{t}<ArrowUpRight size={11}/></button>)}</div>
   {searched&&<div className="ux-results"><div className="ux-result-head"><div><span>DISCOVERY RESULTS</span><h3>{searched}</h3></div><small>Encyclopedia search · Wikipedia</small></div>{error&&<p className="ux-error">{error}</p>}{results.map((r,i)=><article className="ux-result" key={r.title}><span>{String(i+1).padStart(2,'0')}</span><div><h4>{r.title}</h4><p>{r.snippet.replace(/\s+/g,' ')}</p><a href={r.url} target="_blank" rel="noreferrer">READ SOURCE <ExternalLink size={11}/></a></div></article>)}</div>}
   <div className="ux-source-note"><BookOpen size={14}/><p><b>Source transparency.</b> These are live encyclopedia search results, not a complete AI-written course. ARVENA will need connected research and AI services to create fully structured, cited lessons across every field.</p></div>
  </>:<div className="ux-video-layout">
   <div className="ux-video-main">
    <div className="ux-video-title"><div><span>EDUCATIONAL VIDEO PLAYER</span><h3>{active?.title||'Add a video to begin learning'}</h3></div><PlayCircle size={22}/></div>
    {active?<div className="ux-player"><iframe src={active.id} title={active.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>:<div className="ux-player-empty"><Video size={34}/><b>Your learning screen</b><p>Save a YouTube or Vimeo lesson link to play it here.</p></div>}
    <div className="ux-add-video"><label>VIDEO TITLE<input value={videoTitle} onChange={e=>setVideoTitle(e.target.value)} placeholder="e.g. Introduction to cosmology"/></label><label>YOUTUBE OR VIMEO URL<input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="Paste a video link"/></label><button disabled={!videoEmbed(videoUrl)} onClick={addVideo}>SAVE & PLAY VIDEO</button></div>
    <p className="ux-video-hint">Find existing lessons with <a href={'https://www.youtube.com/results?search_query='+encodeURIComponent(searched||query||'educational lesson')} target="_blank" rel="noreferrer">YouTube search <ExternalLink size={11}/></a>, then paste a permitted video link above. Some creators disable embedding.</p>
   </div>
   <aside className="ux-video-list"><div><span>YOUR SAVED VIDEOS</span><b>{videos.length} LESSONS</b></div>{videos.length?videos.map(v=><article key={v.id} className={active?.id===v.id?'selected':''}><button onClick={()=>setActive(v)}><PlayCircle size={16}/><span><b>{v.title}</b><small>{v.provider}</small></span></button><button className="ux-remove" onClick={()=>removeVideo(v.id)} aria-label="Remove saved video">×</button></article>):<p className="ux-empty">Your saved video lessons will appear here.</p>}</aside>
   <div className="ux-ai-video"><div><span><GraduationCap size={14}/> ORIGINAL AI VIDEO STUDIO</span><b>Animated lessons with narration & subtitles</b><p>AI video generation is not connected yet. It requires a video-generation provider and a secure backend. ARVENA will not label narration or static slides as a generated video.</p></div><small>PROVIDER NOT CONNECTED</small></div>
  </div>}
 </section>;
}
