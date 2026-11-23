import {useEffect,useState} from 'react';
import Aeris from './Aeris';
import {getLevel,xpIntoLevel,completeMissionReward,redeemReward} from './core/system';
import {Activity,BookOpen,CalendarDays,Check,Compass,Download,Edit3,Flame,LayoutDashboard,Menu,Plus,Settings,Sparkles,Search,Target,Trash2,Trophy,Upload,Wallet,X,Zap,Moon,Sun} from 'lucide-react';
import KnowledgeMarketplace from './KnowledgeMarketplace';
type Page='Overview'|'Missions'|'Planner'|'Dream Life'|'Evolution'|'Knowledge'|'Rewards'|'Journal'|'Reports'|'Settings';
type Item={id:string;title:string;created:string;[key:string]:any};
type ActivityEvent={id:string;type:string;title:string;detail?:string;created:string};
type Data={missions:Item[];tasks:Item[];goals:Item[];knowledge:Item[];rewards:Item[];journal:Item[];activity:ActivityEvent[];xp:number;credits:number};
const blank:Data={missions:[],tasks:[],goals:[],knowledge:[],rewards:[],journal:[],activity:[],xp:0,credits:0};
const KEY='uls-data-v1',today=()=>new Date().toISOString().slice(0,10),id=()=>crypto.randomUUID();
const activityEvent=(type:string,title:string,detail=''):ActivityEvent=>({id:id(),type,title,detail,created:new Date().toISOString()});
const navGroups:{title:string;pages:Page[]}[]=[
 {title:'WORKSPACE',pages:['Overview','Missions','Planner']},
 {title:'GROWTH',pages:['Dream Life','Evolution','Knowledge','Rewards']},
 {title:'PERSONAL',pages:['Journal','Reports']},
 {title:'SYSTEM',pages:['Settings']}
];
const mobilePages:Page[]=['Overview','Missions','Planner','Knowledge'];
const labels:Record<Page,string>={'Overview':'Command Center','Missions':'Mission Control','Planner':'Daily Planner','Dream Life':'Dream Life','Evolution':'Personal Evolution','Knowledge':'Knowledge Library','Rewards':'Rewards & Achievements','Journal':'Personal Journal','Reports':'System Reports','Settings':'Settings'};
function read():Data{try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');return {...blank,...saved,activity:Array.isArray(saved.activity)?saved.activity:[]}}catch{return blank}}
function App(){
 const[data,setData]=useState<Data>(read),[page,setPage]=useState<Page>('Overview'),[modal,setModal]=useState<Page|null>(null),[editing,setEditing]=useState<Item|null>(null),[mobile,setMobile]=useState(false),[sidebarCollapsed,setSidebarCollapsed]=useState(false),[toast,setToast]=useState(''),[search,setSearch]=useState(''),[theme,setTheme]=useState<'dark'|'light'>(()=>localStorage.getItem('arvena-theme')==='light'?'light':'dark');
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(data))},[data]);useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('arvena-theme',theme)},[theme]);useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2400);return()=>clearTimeout(t)}},[toast]);
 const key=(p:Page)=>p==='Missions'?'missions':p==='Planner'?'tasks':p==='Dream Life'?'goals':p==='Knowledge'?'knowledge':p==='Rewards'?'rewards':'journal';
 const open=(p:Page,item?:Item)=>{setEditing(item||null);setModal(p)};
 const remove=(p:Page,item:Item)=>{setData(d=>({...d,[key(p)]:d[key(p)].filter(x=>x.id!==item.id),activity:[activityEvent('deleted',`Deleted ${labels[p]} item`,item.title),...d.activity].slice(0,500)}));setToast('Deleted')};
 const save=(p:Page,form:HTMLFormElement)=>{const f=new FormData(form),v=(k:string)=>String(f.get(k)||''),old=editing;const base={id:old?.id||id(),title:v('title'),created:old?.created||new Date().toISOString()};
 let item:Item=base;
 if(p==='Missions')item={...base,description:v('description'),category:v('category'),difficulty:v('difficulty'),xp:+v('xp'),deadline:v('deadline'),done:old?.done||false};
 if(p==='Planner')item={...base,date:v('date'),category:v('category'),priority:v('priority'),done:old?.done||false};
 if(p==='Dream Life')item={...base,description:v('description'),area:v('area'),target:v('target'),progress:+v('progress')};
 if(p==='Knowledge')item={...base,subject:v('subject'),level:v('level'),done:old?.done||false};
 if(p==='Rewards')item={...base,description:v('description'),type:v('type'),cost:+v('cost'),redeemed:old?.redeemed||false};
 if(p==='Journal')item={...base,content:v('content'),mood:v('mood')};
 setData(d=>({...d,[key(p)]:old?d[key(p)].map(x=>x.id===old.id?item:x):[item,...d[key(p)]],activity:[activityEvent(old?'updated':'created',`${old?'Updated':'Created'} ${labels[p]} item`,item.title),...d.activity].slice(0,500)}));setModal(null);setEditing(null);setToast(old?'Saved changes':'Added successfully')};
 const spendCredits=(amount:number)=>{if(data.credits<amount){setToast('Not enough credits');return false;}setData(d=>({...d,credits:d.credits-amount}));setToast('Course unlocked permanently');return true;};
 const completeMission=(m:Item)=>{
  setData(d=>{
    const result=completeMissionReward(d.missions,d.xp,d.credits,m.id);
    if(!result.awarded)return d;
    setToast('Mission complete · XP and credits awarded');
    return {...d,missions:result.missions,xp:result.xp,credits:result.credits,activity:[activityEvent('mission-completed','Mission completed',m.title),...d.activity].slice(0,500)};
  });
};
 const redeem=(r:Item)=>{
  setData(d=>{
    const result=redeemReward(d.rewards,d.credits,r.id);
    if(!result.redeemed){setToast(result.reason);return d;}
    setToast('Reward redeemed');
    return {...d,rewards:result.rewards,credits:result.credits,activity:[activityEvent('reward-redeemed','Reward redeemed',r.title),...d.activity].slice(0,500)};
  });
};
 const list=(p:Page)=>data[key(p)].filter(x=>x.title.toLowerCase().includes(search.toLowerCase()));
 const tasksToday=data.tasks.filter(x=>x.date===today()),doneToday=tasksToday.filter(x=>x.done).length;
  const openMissions=data.missions.filter(x=>!x.done),activeGoals=data.goals.filter(x=>(x.progress||0)<100),levelProgress=xpIntoLevel(data.xp),greeting=new Date().getHours()<12?'GOOD MORNING':new Date().getHours()<18?'GOOD AFTERNOON':'GOOD EVENING',focusTask=tasksToday.find(x=>!x.done);
 const navIcon:Record<Page,any>={Overview:LayoutDashboard,Missions:Target,Planner:CalendarDays,'Dream Life':Compass,Evolution:Activity,Knowledge:BookOpen,Rewards:Trophy,Journal:Edit3,Reports:Flame,Settings:Settings};
 return <div className="shell">
 {mobile&&<button className="scrim" onClick={()=>setMobile(false)}/>}<aside className={'sidebar '+(mobile?'show':'')+(sidebarCollapsed?' collapsed':'')}>
 <div className="brand"><span className="brand-mark"><img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" /></span><div><b>ARVENA</b><small>PERSONAL INTELLIGENCE</small></div><button className="close" onClick={()=>setMobile(false)}><X/></button></div>
 <div className="operator"><div className="operator-avatar"><Sparkles size={17}/></div><div><b>System Operator</b><small>LEVEL {getLevel(data.xp)} <span>·</span> {data.xp.toLocaleString()} XP</small></div><span className="operator-live"/></div>
 <div className="sidebar-label">NAVIGATION</div>
 <div className="sidebar-navigation">{navGroups.map(group=><section className="nav-group" key={group.title}><small>{group.title}</small>{group.pages.map(p=>{const I=navIcon[p];return <button key={p} className={'nav '+(page===p?'active':'')} onClick={()=>{setPage(p);setMobile(false)}}><I size={17}/><span>{labels[p]}</span>{page===p&&<i className="nav-active-dot"/>}</button>})}</section>)}</div>
 <div className="sidefoot"><span className="system-indicator"/> PRIVATE SYSTEM <span>V1.0</span></div></aside>
 <main><header className="topbar"><div className="topbar-left"><button className="hamb" onClick={()=>{if(window.innerWidth<=700){setSidebarCollapsed(false);setMobile(true)}else setSidebarCollapsed(v=>!v)}} aria-label="Toggle navigation menu"><Menu size={21}/></button><div className="topbar-brand"><b>ARVENA</b><small>PERSONAL INTELLIGENCE SYSTEM</small></div><span className="topbar-page">{labels[page]}</span></div><div className="topbar-tools"><label className="global-search"><Search size={15}/><input placeholder="Search this workspace..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')}><X size={13}/></button>}</label><div className="chips"><button className="theme-toggle" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==='dark'?'LIGHT':'DARK'}</span></button><i><Zap size={14}/> LEVEL {getLevel(data.xp)}</i><i><Wallet size={14}/> {data.credits.toLocaleString()} CREDITS</i></div></div></header>
 <div className="content">
  {page==='Overview'&&<div className="command-dashboard">
   <section className="command-hero">
    <div className="command-hero-copy">
     <div className="command-eyebrow"><i/> ARVENA / PERSONAL COMMAND</div>
     <div className="command-greeting">{greeting}, OPERATOR</div>
     <h1>Make today<br/><em>move you forward.</em></h1>
     <p>Your command centre for focused execution, meaningful learning and long-term progress.</p>
     <div className="command-hero-actions"><button className="primary" onClick={()=>open('Planner')}><CalendarDays size={15}/> PLAN MY DAY</button><button className="secondary" onClick={()=>open('Missions')}><Target size={15}/> SET A MISSION</button></div>
    </div>
    <div className="command-level-card">
     <div className="command-level-ring"><span>LVL</span><b>{getLevel(data.xp)}</b></div>
     <small>OPERATOR LEVEL</small><strong>{levelProgress} <span>/ 500 XP</span></strong>
     <div className="command-level-track"><i style={{width:(levelProgress/5)+'%'}}/></div>
     <span className="command-level-caption">XP TO NEXT LEVEL</span>
    </div>
   </section>
   <div className="command-date-row"><div><small>TODAY'S OPERATING WINDOW</small><b>{new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</b></div><span className="command-live"><i/> PRIVATE SYSTEM · LOCAL DATA</span></div>
   <section className="command-metrics">
    <article><span className="command-metric-icon"><CalendarDays size={17}/></span><div><small>TASKS FOR TODAY</small><b>{tasksToday.length}</b><span>{tasksToday.length-doneToday} remaining</span></div></article>
    <article><span className="command-metric-icon"><Check size={17}/></span><div><small>COMPLETED TODAY</small><b>{doneToday} <em>/ {tasksToday.length}</em></b><span>{tasksToday.length?Math.round(doneToday/tasksToday.length*100)+'% execution':'No tasks scheduled'}</span></div></article>
    <article><span className="command-metric-icon"><Target size={17}/></span><div><small>ACTIVE MISSIONS</small><b>{openMissions.length}</b><span>{data.missions.filter(x=>x.done).length} completed overall</span></div></article>
    <article><span className="command-metric-icon"><Compass size={17}/></span><div><small>ACTIVE GOALS</small><b>{activeGoals.length}</b><span>{data.goals.filter(x=>(x.progress||0)>=100).length} achieved</span></div></article>
   </section>
   <div className="command-main-grid">
    <section className="command-panel command-today">
     <div className="command-panel-head"><div><small>EXECUTION / 01</small><h2>Today's plan</h2><p>Turn your priorities into completed actions.</p></div><button className="command-text-action" onClick={()=>setPage('Planner')}>OPEN PLANNER ↗</button></div>
     <div className="command-execution"><div><span>DAILY EXECUTION</span><b>{tasksToday.length?Math.round(doneToday/tasksToday.length*100):0}%</b></div><div className="command-execution-track"><i style={{width:(tasksToday.length?doneToday/tasksToday.length*100:0)+'%'}}/></div></div>
     {tasksToday.length?tasksToday.map(t=><div className="command-task-row" key={t.id}><Task item={t} toggle={()=>setData(d=>({...d,tasks:d.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x),activity:[activityEvent(t.done?'task-reopened':'task-completed',t.done?'Task reopened':'Task completed',t.title),...d.activity].slice(0,500)}))}/><span className={t.done?'command-task-status done':'command-task-status'}>{t.done?'COMPLETE':t.priority||'SCHEDULED'}</span></div>):<div className="command-empty"><div className="command-empty-symbol"><CalendarDays size={21}/></div><b>Your day is open.</b><p>Add a task to create a clear plan and track your execution here.</p><button className="primary mini" onClick={()=>open('Planner')}><Plus size={13}/> ADD FIRST TASK</button></div>}
    </section>
    <div className="command-side-stack">
     <section className="command-panel command-focus">
      <div className="command-panel-head"><div><small>INTELLIGENCE / 02</small><h2>Next best move</h2></div><span className="command-focus-mark"><Sparkles size={17}/></span></div>
      <b>{focusTask?focusTask.title:openMissions[0]?.title||(activeGoals[0]?.title)||'Choose your first priority'}</b>
      <p>{focusTask?'This is your next unfinished task scheduled for today. Complete it before adding more commitments.':openMissions.length?'Your schedule is clear. Make progress on one active mission.':activeGoals.length?'Your day is open. Take one concrete step toward an active goal.':'Create a mission or goal to give your effort a direction.'}</p>
      <button className="command-focus-action" onClick={()=>focusTask?setPage('Planner'):openMissions.length?setPage('Missions'):open('Missions')}>{focusTask?'VIEW TODAY’S TASK':openMissions.length?'OPEN MISSION CONTROL':'CREATE A MISSION'} <span>↗</span></button>
     </section>
     <section className="command-panel command-missions">
      <div className="command-panel-head"><div><small>LONG-TERM EXECUTION / 03</small><h2>Active missions</h2></div><button className="command-text-action" onClick={()=>setPage('Missions')}>VIEW ALL ↗</button></div>
      {openMissions.slice(0,3).map(m=><div className="command-mission-row" key={m.id}><span><Target size={15}/></span><div><b>{m.title}</b><small>{m.category||'MISSION'} · {m.xp||0} XP</small></div></div>)}
      {!openMissions.length&&<div className="command-inline-empty">No active missions yet. Define an outcome worth working toward.</div>}
     </section>
    </div>
   </div>
   <div className="command-lower-grid">
    <section className="command-panel">
     <div className="command-panel-head"><div><small>VISION / 04</small><h2>Long-range direction</h2><p>Your goals, translated into visible progress.</p></div><button className="command-text-action" onClick={()=>setPage('Dream Life')}>VIEW GOALS ↗</button></div>
     {activeGoals.slice(0,3).map(g=><div className="command-goal-row" key={g.id}><div><b>{g.title}</b><span>{g.progress||0}%</span></div><div className="command-execution-track"><i style={{width:(g.progress||0)+'%'}}/></div></div>)}
     {!activeGoals.length&&<div className="command-inline-empty">Your vision board is waiting. Add a goal to start tracking your direction.</div>}
    </section>
    <section className="command-panel">
     <div className="command-panel-head"><div><small>SYSTEM LOG / 05</small><h2>Recent activity</h2><p>A record of actions saved in this browser.</p></div><button className="command-text-action" onClick={()=>setPage('Reports')}>REPORTS ↗</button></div>
     {data.activity.slice(0,4).map(e=><div className="command-activity-row" key={e.id}><i/><div><b>{e.title}</b><span>{e.detail||e.type}</span></div><time>{new Date(e.created).toLocaleDateString()}</time></div>)}
     {!data.activity.length&&<div className="command-inline-empty">Your activity log will appear here as you use ARVENA.</div>}
    </section>
   </div>
  </div>}
 {page==='Missions'&&<><Head page={page} onAdd={()=>open(page)}/>{list(page).map(m=><Record key={m.id} item={m} onEdit={()=>open(page,m)} onDelete={()=>remove(page,m)} extra={<><small>{m.category} · {m.difficulty} · {m.xp} XP</small>{!m.done&&<button className="primary mini" onClick={()=>completeMission(m)}>COMPLETE</button>}{m.done&&<b className="green">COMPLETED</b>}</>}/>)}{!data.missions.length&&<Empty text="No missions yet." onAdd={()=>open(page)}/>}</>}
 {page==='Planner'&&<><Head page={page} onAdd={()=>open(page)}/>{list(page).sort((a,b)=>a.date.localeCompare(b.date)).map(t=><div className="record" key={t.id}><Task item={t} toggle={()=>setData(d=>({...d,tasks:d.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x),activity:[activityEvent(t.done?'task-reopened':'task-completed',t.done?'Task reopened':'Task completed',t.title),...d.activity].slice(0,500)}))}/><small>{t.date} · {t.category} · {t.priority}</small><Actions edit={()=>open(page,t)} del={()=>remove(page,t)}/></div>)}{!data.tasks.length&&<Empty text="Your planner is empty." onAdd={()=>open(page)}/>}</>}
 {page==='Dream Life'&&<><Head page={page} onAdd={()=>open(page)}/><div className="grid">{list(page).map(g=><article className="panel" key={g.id}><Actions edit={()=>open(page,g)} del={()=>remove(page,g)}/><span className="tag">{g.area}</span><h3>{g.title}</h3><p>{g.description}</p><div className="bar"><i style={{width:g.progress+'%'}}/></div><small>{g.progress}% · {g.target||'No target date'}</small><input type="range" min="0" max="100" value={g.progress} onChange={e=>setData(d=>({...d,goals:d.goals.map(x=>x.id===g.id?{...x,progress:+e.target.value}:x)}))}/></article>)}</div>{!data.goals.length&&<Empty text="Define the life you want to build." onAdd={()=>open(page)}/>}</>}
 {page==='Evolution'&&<><Head page={page}/><div className="stats">{[[Flame,'LEVEL',getLevel(data.xp)],[Zap,'TOTAL XP',data.xp],[Target,'MISSIONS DONE',data.missions.filter(x=>x.done).length],[BookOpen,'LEARNING DONE',data.knowledge.filter(x=>x.done).length]].map(([I,l,v]:any)=><Stat key={l} icon={I} label={l} value={v}/>)}</div><Panel title="LEVEL PROGRESSION"><p>{xpIntoLevel(data.xp)} / 500 XP to next level</p><div className="bar"><i style={{width:(xpIntoLevel(data.xp))/5+'%'}}/></div></Panel></>}
 {page==='Knowledge'&&<><Head page={page}/><KnowledgeMarketplace credits={data.credits} onSpend={spendCredits}/></>}
 {page==='Rewards'&&<><Head page={page} onAdd={()=>open(page)}/><div className="stats"><Stat icon={Wallet} label="AVAILABLE CREDITS" value={data.credits}/><Stat icon={Trophy} label="REWARDS" value={data.rewards.length}/></div><div className="grid">{list(page).map(r=><article className="panel" key={r.id}><Actions edit={()=>open(page,r)} del={()=>remove(page,r)}/><span className="tag">{r.type}</span><h3>{r.title}</h3><p>{r.description}</p><b>{r.cost} credits</b>{r.redeemed?<p className="green">REDEEMED</p>:<button className="primary mini" onClick={()=>redeem(r)}>REDEEM</button>}</article>)}</div>{!data.rewards.length&&<Empty text="Create rewards for your progress." onAdd={()=>open(page)}/>}</>}
 {page==='Journal'&&<><Head page={page} onAdd={()=>open(page)}/>{list(page).map(e=><article className="panel" key={e.id}><Actions edit={()=>open(page,e)} del={()=>remove(page,e)}/><small>{e.created.slice(0,10)} · {e.mood}</small><h3>{e.title}</h3><p>{e.content}</p></article>)}{!data.journal.length&&<Empty text="Your journal is waiting for its first entry." onAdd={()=>open(page)}/>}</>}
 {page==='Reports'&&<><Head page={page}/><section className="report-hero"><div><small>ARVENA / REPORTS / MODULE</small><h2>System Reports</h2><p>Review your activity and see where your effort is going.</p></div><div className="report-total"><b>{data.missions.filter(x=>x.done).length+data.tasks.filter(x=>x.done).length+data.knowledge.filter(x=>x.done).length}</b><span>COMPLETED ACTIONS</span></div></section><div className="stats"><Stat icon={Target} label="MISSIONS COMPLETE" value={data.missions.filter(x=>x.done).length}/><Stat icon={Check} label="TASKS COMPLETE" value={data.tasks.filter(x=>x.done).length}/><Stat icon={BookOpen} label="LEARNING COMPLETE" value={data.knowledge.filter(x=>x.done).length}/><Stat icon={Trophy} label="LEVEL" value={getLevel(data.xp)}/></div><div className="report-grid"><Panel title="EFFORT DISTRIBUTION">{[{name:'Missions',count:data.missions.length,done:data.missions.filter(x=>x.done).length},{name:'Planner tasks',count:data.tasks.length,done:data.tasks.filter(x=>x.done).length},{name:'Learning items',count:data.knowledge.length,done:data.knowledge.filter(x=>x.done).length},{name:'Goals',count:data.goals.length,done:data.goals.filter(x=>(x.progress||0)>=100).length},{name:'Journal entries',count:data.journal.length,done:data.journal.length}].map(x=><div className="report-row" key={x.name}><div><b>{x.name}</b><span>{x.done} completed / {x.count} recorded</span></div><div className="report-track"><i style={{width:(x.count?x.done/x.count*100:0)+'%'}}/></div></div>)}</Panel><Panel title="PERSONAL PROGRESSION"><div className="report-metric"><span>EXPERIENCE POINTS</span><b>{data.xp.toLocaleString()} XP</b></div><div className="report-metric"><span>AVAILABLE CREDITS</span><b>{data.credits.toLocaleString()}</b></div><div className="report-metric"><span>CURRENT LEVEL</span><b>{getLevel(data.xp)}</b></div><p className="muted">Credits and XP are tracked separately. Spending Credits does not reduce your XP.</p></Panel></div><Panel title="RECORDED ACTIVITY"><div className="report-metric"><span>TRACKED EVENTS</span><b>{data.activity.length}</b></div><p>{data.missions.length} missions · {data.tasks.length} tasks · {data.goals.length} goals · {data.knowledge.length} learning items · {data.journal.length} journal entries.</p>{data.activity.length>0?<div className="activity-feed">{data.activity.slice(0,12).map(event=><div className="activity-event" key={event.id}><i/><div><b>{event.title}</b><span>{event.detail||event.type}</span></div><time>{new Date(event.created).toLocaleString()}</time></div>)}</div>:<div className="report-empty"><Activity size={20}/><b>Your activity history starts here.</b><span>New creations, edits, completions, deletions and redemptions will be recorded here. Older activity is not reconstructed.</span></div>}</Panel></>}
 {page==='Settings'&&<><Head page={page}/><Panel title="APPEARANCE"><p>Choose the look of your personal system. Your preference is saved on this device.</p><div className="theme-options"><button className={theme==='light'?'primary':'secondary'} onClick={()=>setTheme('light')}><Sun size={15}/> LIGHT THEME</button><button className={theme==='dark'?'primary':'secondary'} onClick={()=>setTheme('dark')}><Moon size={15}/> DARK THEME</button></div></Panel><Panel title="BACKUP & RESTORE"><p>Your data is stored in this browser. Export backups regularly; browser data can be erased.</p><button className="primary" onClick={()=>{const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify({...data,knowledgeMarketplace:JSON.parse(localStorage.getItem('arvena-knowledge-progress-v1')||'{\"owned\":[],\"done\":{},\"scores\":{}}')},null,2)],{type:'application/json'}));a.href=u;a.download='arvena-backup.json';a.click();URL.revokeObjectURL(u)}}><Download size={15}/> EXPORT BACKUP</button> <label className="secondary upload"><Upload size={15}/> RESTORE BACKUP<input hidden type="file" accept="application/json" onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(String(r.result));if(!Array.isArray(x.missions)||!Array.isArray(x.tasks))throw 0;if(x.knowledgeMarketplace&&typeof x.knowledgeMarketplace==='object')localStorage.setItem('arvena-knowledge-progress-v1',JSON.stringify(x.knowledgeMarketplace));setData({...blank,...x,activity:Array.isArray(x.activity)?x.activity:[]});setToast('Backup restored')}catch{setToast('Invalid backup')}};r.readAsText(f)}}/></label></Panel><Panel title="CAPABILITIES & PRIVACY"><p>This is a local-first browser app. It does not currently include AI model connections, cloud sync, authentication, encrypted backup, Android packaging or health-provider integrations.</p><p className="muted">Local browser storage is not encrypted. Keep exported backups private.</p></Panel><Panel title="RESET DATA"><button className="danger" onClick={()=>{if(confirm('Delete all local ARVENA data?'))setData(blank)}}>RESET ALL DATA</button></Panel></>}
 </div><footer><span>ARVENA</span> · PERSONAL INTELLIGENCE SYSTEM <span className="footer-right">THINK BEYOND. EVOLVE BEYOND.</span></footer></main>
 <nav className="mobile-dock">{mobilePages.map(p=>{const I=navIcon[p];return <button key={p} className={page===p?'active':''} onClick={()=>setPage(p)}><I size={18}/><span>{p==='Overview'?'Home':p==='Knowledge'?'Learn':p}</span></button>})}</nav>
 {modal&&<Modal page={modal} initial={editing} close={()=>{setModal(null);setEditing(null)}} save={f=>save(modal,f)}/>}
 {toast&&<div className="toast">✓　{toast}</div>} 
 <Aeris />
 </div>
}
function Stat({icon:I,label,value}:{icon:any;label:string;value:any}){return <div className="stat"><I size={19}/><div><small>{label}</small><b>{value}</b></div></div>}
function Panel({title,children}:{title:string;children:any}){return <section className="panel"><h4>{title}</h4>{children}</section>}
const pageDescriptions:Record<Page,string>={Overview:'Your personal command surface for focus, execution and forward momentum.',Missions:'Turn important outcomes into clear missions with measurable rewards.',Planner:'Shape your day with deliberate priorities and realistic execution.', 'Dream Life':'Keep your long-range vision visible and turn it into steady progress.',Evolution:'Track your growth through consistency, learning and completed challenges.',Knowledge:'Explore disciplines, build understanding and keep what you learn.',Rewards:'Connect meaningful effort with rewards you choose.',Journal:'Capture reflections, decisions and moments worth remembering.',Reports:'Review your activity and see where your effort is going.',Settings:'Configure your private intelligence system and protect your data.'};
function Head({page,onAdd}:{page:Page;onAdd?:()=>void}){return <div className="head"><div className="head-copy"><small>ARVENA / {page.toUpperCase()} / MODULE</small><h1>{labels[page]}</h1><p>{pageDescriptions[page]}</p></div><div className="head-actions"><span className="module-state"><i/> PERSONAL WORKSPACE</span>{onAdd&&<button className="primary" onClick={onAdd}><Plus size={15}/> CREATE NEW</button>}</div></div>}
function Empty({text,onAdd}:{text:string;onAdd:()=>void}){return <div className="empty">{text}<br/><button className="textbtn" onClick={onAdd}>＋ Add a record</button></div>}
function Actions({edit,del}:{edit:()=>void;del:()=>void}){return <div className="actions"><button onClick={edit}><Edit3 size={15}/></button><button onClick={del}><Trash2 size={15}/></button></div>}
function Record({item,onEdit,onDelete,extra}:{item:Item;onEdit:()=>void;onDelete:()=>void;extra:any}){return <article className="record"><div className="recordtext"><h3>{item.title}</h3><p>{item.description}</p>{extra}</div><Actions edit={onEdit} del={onDelete}/></article>}
function Task({item,toggle}:{item:Item;toggle:()=>void}){return <div className="task"><button className={item.done?'checked':''} onClick={toggle}><Check size={13}/></button><b className={item.done?'strike':''}>{item.title}</b></div>}
function Modal({page,initial,close,save}:{page:Page;initial:Item|null;close:()=>void;save:(f:HTMLFormElement)=>void}){
 const title=labels[page]||page;
 return <div className="backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><form className="modal" onSubmit={e=>{e.preventDefault();save(e.currentTarget)}}><div className="modalhead"><div><small>ARVENA / RECORD</small><h2>{initial?'Edit record':title}</h2></div><button type="button" onClick={close}><X/></button></div>
 <label>Title<input name="title" required maxLength={120} defaultValue={initial?.title||''}/></label>
 {page==='Missions'&&<><label>Description<textarea name="description" defaultValue={initial?.description||''}/></label><div className="formgrid"><label>Category<select name="category" defaultValue={initial?.category||'Personal'}>{['Personal','Studies','Business','Health','Fitness','Learning'].map(x=><option>{x}</option>)}</select></label><label>Difficulty<select name="difficulty" defaultValue={initial?.difficulty||'Medium'}>{['Easy','Medium','Hard','Elite'].map(x=><option>{x}</option>)}</select></label></div><label>XP reward<input name="xp" type="number" min="0" defaultValue={initial?.xp??50}/></label><label>Deadline<input name="deadline" type="date" defaultValue={initial?.deadline||''}/></label></>}
 {page==='Planner'&&<><label>Date<input name="date" type="date" defaultValue={initial?.date||today()} required/></label><div className="formgrid"><label>Category<select name="category" defaultValue={initial?.category||'Personal'}>{['Personal','Studies','Business','Health','Fitness','Other'].map(x=><option>{x}</option>)}</select></label><label>Priority<select name="priority" defaultValue={initial?.priority||'Medium'}>{['Low','Medium','High'].map(x=><option>{x}</option>)}</select></label></div></>}
 {page==='Dream Life'&&<><label>Description<textarea name="description" defaultValue={initial?.description||''}/></label><div className="formgrid"><label>Life area<select name="area" defaultValue={initial?.area||'Personal'}>{['Career','Business','Financial','Home & Lifestyle','Health','Education','Family','Experiences','Personal'].map(x=><option>{x}</option>)}</select></label><label>Target date<input name="target" type="date" defaultValue={initial?.target||''}/></label></div><label>Progress<input name="progress" type="number" min="0" max="100" defaultValue={initial?.progress??0}/></label></>}
 {page==='Knowledge'&&<div className="formgrid"><label>Subject<input name="subject" required defaultValue={initial?.subject||''}/></label><label>Level<select name="level" defaultValue={initial?.level||'Fundamentals'}>{['Fundamentals','Beginner','Intermediate','Advanced','Expert'].map(x=><option>{x}</option>)}</select></label></div>}
 {page==='Rewards'&&<><label>Description<textarea name="description" defaultValue={initial?.description||''}/></label><div className="formgrid"><label>Type<select name="type" defaultValue={initial?.type||'Personal'}>{['Personal','Learning','Experience','Purchase','Milestone'].map(x=><option>{x}</option>)}</select></label><label>Credit cost<input name="cost" type="number" min="1" defaultValue={initial?.cost??10}/></label></div></>}
 {page==='Journal'&&<><label>Entry<textarea name="content" required rows={5} defaultValue={initial?.content||''}/></label><label>Mood<select name="mood" defaultValue={initial?.mood||'Neutral'}>{['Neutral','Happy','Focused','Grateful','Stressed','Sad','Motivated'].map(x=><option>{x}</option>)}</select></label></>}
 <div className="modalactions"><button type="button" className="secondary" onClick={close}>CANCEL</button><button className="primary" type="submit"><Check size={15}/> SAVE</button></div></form></div>
}
export default App;
