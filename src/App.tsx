import {useEffect,useRef,useState} from 'react';
import {useAsteriaData} from './hooks/useAsteriaData';
import {blank,today,id,rewardMetrics,type Data,type Item} from './core/appData';
import CommandCenter from './components/CommandCenter';
import UniversalExplorer from './UniversalExplorer';
import MissionControl from './components/MissionControl';
import DailyPlanner from './components/DailyPlanner';
import DreamLife from './components/DreamLife';
import KnowledgeLibrary from './components/KnowledgeLibrary';
import VideoLearningStudio from './components/VideoLearningStudio';
import PersonalEvolution from './components/PersonalEvolution';
import RewardsAchievements from './components/RewardsAchievements';
import PersonalJournal from './components/PersonalJournal';
import SystemReports from './components/SystemReports';
import SettingsSecurity from './components/SettingsSecurity';
import RecordModal from './components/RecordModal';
import {syncMissionTask,removeMissionTasks} from './core/planner';
import {normalizeMission,transitionMission,assignMissionToPlanner,missionReward} from './core/missions';
import type { LifeGoal, GoalMilestone } from './core/goals';
import './components/MissionControl.css';
import {getLevel,xpIntoLevel} from './core/system';
import {claimAchievement,redeemPersonalReward,fulfillPersonalReward,unlockSystemItem} from './core/rewards';
import {clearStoredAppData} from './core/storage';
import {getNotificationAccess,requestNotificationAccess,sendSystemNotification} from './core/permissions';
import {Activity,BookOpen,CalendarDays,ChevronRight,Compass,Edit3,Flame,LayoutDashboard,Menu,Plus,Settings,Target,Trophy,Wallet,Video as VideoIcon,X,Zap,Sun,Moon} from 'lucide-react';
type Page='Explore'|'Overview'|'Missions'|'Planner'|'Dream Life'|'Evolution'|'Knowledge'|'Videos'|'Rewards'|'Journal'|'Reports'|'Settings';
const sections:Page[]=['Explore','Overview','Missions','Planner','Dream Life','Evolution','Knowledge','Videos','Rewards','Journal','Reports','Settings'];
const labels:Record<Page,string>={'Explore':'Universal Explorer','Overview':'Command Center','Missions':'Mission Control','Planner':'Daily Planner','Dream Life':'Dream Life','Evolution':'Personal Evolution','Knowledge':'Knowledge Library','Videos':'Video Learning Studio','Rewards':'Rewards & Achievements','Journal':'Personal Journal','Reports':'System Reports','Settings':'Settings'};
function App(){
 const {data,setData,setPersistenceReady,storageHealthy,persistenceError,loadError,loadWarning}=useAsteriaData();
 const[notificationAccess,setNotificationAccess]=useState(getNotificationAccess);
 const[theme,setTheme]=useState<'dark'|'light'>(()=>{try{return (window.localStorage.getItem('asteria-theme')||window.localStorage.getItem('arvena-theme'))==='light'?'light':'dark'}catch{return 'dark'}});
 const[page,setPage]=useState<Page>('Overview'),[modal,setModal]=useState<Page|null>(null),[editing,setEditing]=useState<Item|null>(null),[plannerDate,setPlannerDate]=useState(today()),[mobile,setMobile]=useState(false),[toast,setToast]=useState(loadWarning||loadError),[search,setSearch]=useState('');
 const focusReturnRef=useRef<HTMLElement|null>(null);
 useEffect(()=>{if(persistenceError)setToast(persistenceError)},[persistenceError]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{window.localStorage.setItem('asteria-theme',theme)}catch{/* Theme preference is optional. */}},[theme]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(t)}},[toast]);
 useEffect(()=>{
  const onKeyDown=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){
    if(mobile)setMobile(false);
    if(modal){setModal(null);setEditing(null);}
    return;
   }
   if(event.key==='Tab'&&(mobile||modal)){
    const dialog=document.querySelector<HTMLElement>(modal?'.backdrop .modal':'.navigation-layer .navigation-panel');
    if(!dialog)return;
    const focusable=Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(element=>!element.hasAttribute('hidden'));
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
   }
  };
  window.addEventListener('keydown',onKeyDown);
  return()=>window.removeEventListener('keydown',onKeyDown);
 },[modal,mobile]);
 useEffect(()=>{
  if(modal)document.querySelector<HTMLElement>('.backdrop .modal input:not([readonly]),.backdrop .modal textarea,.backdrop .modal select')?.focus();
  else if(mobile)document.querySelector<HTMLElement>('.navigation-panel .close')?.focus();
  else if(focusReturnRef.current){focusReturnRef.current.focus();focusReturnRef.current=null;}
 },[modal,mobile]);
 const key=(p:Page)=>p==='Missions'?'missions':p==='Planner'?'tasks':p==='Dream Life'?'goals':p==='Knowledge'?'knowledge':p==='Videos'?'videos':p==='Evolution'?'evolution':p==='Rewards'?'rewards':'journal';
 const open=(p:Page,item?:Item)=>{focusReturnRef.current=document.activeElement as HTMLElement|null;setEditing(item||null);setModal(p)};
 const openPlanner=(date:string)=>{setPlannerDate(date);open('Planner')};
 const remove=(p:Page,item:Item)=>{setData(d=>({...d,[key(p)]:d[key(p)].filter(x=>x.id!==item.id)}));setToast('Deleted')};
 const save=(p:Page,form:HTMLFormElement)=>{const f=new FormData(form),v=(k:string)=>String(f.get(k)||''),old=editing;const base={id:old?.id||id(),title:v('title'),created:old?.created||new Date().toISOString()};
 let item:Item=base;
 if(p==='Missions')item={...base,description:v('description'),category:v('category'),difficulty:v('difficulty'),priority:v('priority'),xp:+v('xp'),deadline:v('deadline'),status:old?.status||'Available',done:old?.done||false,completedAt:old?.completedAt};
 if(p==='Planner')item={...base,date:v('date'),category:v('category'),priority:v('priority'),done:old?.done||false,missionId:old?.missionId,startTime:v('startTime'),durationMinutes:+v('durationMinutes'),notes:v('notes')};
 if(p==='Dream Life')item={...base,description:v('description'),area:v('area'),target:v('target'),progress:+v('progress')};
 if(p==='Knowledge')item={...base,subject:v('subject'),level:v('level'),done:old?.done||false};
 if(p==='Rewards')item={...base,description:v('description'),type:v('type'),cost:+v('cost'),redeemed:old?.redeemed||false};
 if(p==='Journal')item={...base,content:v('content'),mood:v('mood')};
 setData(d=>{const next={...d,[key(p)]:old?d[key(p)].map(x=>x.id===old.id?item:x):[item,...d[key(p)]]};if(p==='Missions'&&old)next.tasks=syncMissionTask(d.tasks as any,item as any) as Item[];return next});setModal(null);setEditing(null);setToast(old?'Saved changes':'Added successfully')};
 const changeMissionStatus=(missionId:string,next:'Active'|'Available')=>{
  setData(d=>{const result=transitionMission(d.missions,missionId,next);if(!result.ok){setToast(result.reason);return d;}setToast(result.reason);return {...d,missions:result.missions};});
 };
 const completeMission=(missionId:string)=>{
  setData(d=>{const current=d.missions.find(m=>m.id===missionId);if(!current){setToast('Mission not found');return d;}const normalized=normalizeMission(current);if(normalized.status!=='Active'){setToast('Activate this mission before completing it');return d;}const result=transitionMission(d.missions,missionId,'Completed');if(!result.ok){setToast(result.reason);return d;}const reward=missionReward(normalized);setToast('Mission completed · '+reward.xp+' XP and '+reward.credits+' credits awarded');return {...d,missions:result.missions,xp:d.xp+reward.xp,credits:d.credits+reward.credits};});
 };
 const addMissionToPlanner=(missionId:string)=>{
  setData(d=>{const result=assignMissionToPlanner(d.missions,d.tasks as any,missionId,today(),id());if(!result.ok){setToast(result.reason);return d;}setToast('Mission added to Daily Planner · no reward is awarded for assignment');return {...d,tasks:result.tasks};});
 };
 const claimRewardAchievement=(achievementId:string)=>{
  setData(d=>{const result=claimAchievement(rewardMetrics(d),d.achievementClaims,achievementId);if(!result.ok){setToast(result.reason);return d;}setToast('Achievement claimed · +'+result.credits+' credits · +'+result.xp+' XP');return {...d,achievementClaims:result.claimed,credits:d.credits+result.credits,xp:d.xp+result.xp};});
 };
 const unlockSystemReward=(unlockId:string,mode:'credits'|'milestone')=>{
  setData(d=>{const result=unlockSystemItem(d.unlockedItems,rewardMetrics(d),d.credits,unlockId,mode);if(!result.ok){setToast(result.reason);return d;}setToast(result.reason);return {...d,unlockedItems:result.unlocked,credits:result.credits};});
 };
 const redeemPersonal=(rewardId:string)=>{
  setData(d=>{const result=redeemPersonalReward(d.rewards,d.credits,rewardId);if(!result.ok){setToast(result.reason);return d;}setToast(result.reason);return {...d,rewards:result.rewards as Item[],credits:result.credits};});
 };
 const fulfillPersonal=(rewardId:string)=>{
  setData(d=>{const result=fulfillPersonalReward(d.rewards,rewardId);if(!result.ok){setToast(result.reason);return d;}setToast(result.reason);return {...d,rewards:result.rewards as Item[]};});
 };
 const list=(p:Page)=>data[key(p)].filter(x=>x.title.toLowerCase().includes(search.toLowerCase()));
 const navIcon:Record<Page,any>={Explore:Compass,Overview:LayoutDashboard,Missions:Target,Planner:CalendarDays,'Dream Life':Compass,Evolution:Activity,Knowledge:BookOpen,Videos:VideoIcon,Rewards:Trophy,Journal:Edit3,Reports:Flame,Settings:Settings};
 return <div className="shell">
 {mobile&&<div className="navigation-layer" style={{position:'fixed',inset:0,zIndex:1000,display:'grid',placeItems:'center',padding:14,background:'rgba(2,7,19,.72)',backdropFilter:'blur(4px)'}} onClick={()=>setMobile(false)}><aside id="asteria-navigation-dialog" role="dialog" aria-modal="true" aria-label="ASTERIA navigation" className="sidebar navigation-panel" style={{position:'relative',inset:'auto',top:'auto',right:'auto',bottom:'auto',left:'auto',width:'min(380px, calc(100vw - 28px))',height:'auto',maxHeight:'calc(100dvh - 28px)',overflowX:'hidden',overflowY:'auto',display:'flex',flexDirection:'column',margin:0,padding:'22px 15px',border:'1px solid #3a4b68',borderRadius:20,transform:'none',visibility:'visible',opacity:1,pointerEvents:'auto',zIndex:1001,boxShadow:'0 24px 80px rgba(0,0,0,.42)'}} onClick={e=>e.stopPropagation()}>
 <div className="brand"><span><img src='./asteria-mark.svg' alt='ASTERIA mark'/></span><div><b>ASTERIA</b><small>PERSONAL SYSTEM</small></div><button className="close" aria-label="Close navigation" onClick={()=>setMobile(false)}><X/></button></div>
 <div className="operator"><b>ASTERIA Operator</b><small>Level {getLevel(data.xp)} · {data.xp} XP</small></div>
 {sections.map(p=>{const I=navIcon[p];return <button key={p} className={'nav '+(page===p?'active':'')} onClick={()=>{setPage(p);setMobile(false)}}><I size={17}/>{labels[p]}{page===p&&<ChevronRight size={14}/>}</button>})}
 <div className="sidefoot">● ASTERIA · LOCAL SYSTEM</div></aside></div>}
 <main><header><button className="hamb" aria-label="Open navigation" aria-expanded={mobile} aria-controls="asteria-navigation-dialog" onClick={()=>{focusReturnRef.current=document.activeElement as HTMLElement|null;setMobile(true)}}><Menu/></button><span>ASTERIA　›　<b>{labels[page].toUpperCase()}</b></span><div className="chips"><button className="theme-toggle" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'}>{theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}<span>{theme==='dark'?'LIGHT':'DARK'}</span></button><i><Wallet size={14}/> {data.credits} credits</i><i><Zap size={14}/> LVL {getLevel(data.xp)}</i></div></header>
 <div className="content">
 {page==='Explore'&&<UniversalExplorer/>}
 {page==='Overview'&&<CommandCenter data={data} level={getLevel(data.xp)} xpIntoLevel={xpIntoLevel(data.xp)} onOpen={p=>open(p)} onNavigate={p=>setPage(p)} onToggleTask={taskId=>setData(d=>({...d,tasks:d.tasks.map(t=>t.id===taskId?{...t,done:!t.done}:t)}))}/>}
 {page==='Missions'&&<><Head page={page} onAdd={()=>open(page)}/><MissionControl missions={list(page)} onEdit={m=>open(page,m as Item)} onDelete={m=>{if(confirm('Delete this mission and its linked planner task, if any?')){setData(d=>({...d,missions:d.missions.filter(x=>x.id!==m.id),tasks:removeMissionTasks(d.tasks as any,m.id) as Item[]}));setToast('Mission deleted')}}} onActivate={missionId=>{const m=data.missions.find(x=>x.id===missionId);changeMissionStatus(missionId,normalizeMission(m||{id:'',title:'',created:''}).status==='Active'?'Available':'Active')}} onComplete={completeMission} onPlanner={addMissionToPlanner}/></>}
 {page==='Planner'&&<DailyPlanner tasks={data.tasks} onAdd={openPlanner} onEdit={task=>open('Planner',task)} onDelete={task=>{if(confirm('Delete this planner task?'))remove('Planner',task)}} onToggle={taskId=>setData(d=>({...d,tasks:d.tasks.map(t=>t.id===taskId?{...t,done:!t.done}:t)}))}/>}
 {page==='Dream Life'&&<DreamLife goals={data.goals} onChange={goals=>setData(d=>({...d,goals}))} onCreateMission={(goal:LifeGoal,milestone:GoalMilestone)=>{const missionId=id();const category=goal.area==='Education'?'Studies':goal.area==='Health'?'Health':goal.area==='Business'||goal.area==='Financial'?'Business':'Personal';const mission={id:missionId,title:milestone.title,created:new Date().toISOString(),description:'Milestone for life goal: '+goal.title,category,difficulty:'Medium',priority:goal.priority,xp:50,deadline:milestone.dueDate||goal.target,status:'Available',done:false,goalId:goal.id,milestoneId:milestone.id};setData(d=>({...d,missions:[mission,...d.missions],goals:d.goals.map(g=>g.id===goal.id?{...g,milestones:(g.milestones||[]).map((m:GoalMilestone)=>m.id===milestone.id?{...m,linkedMissionId:missionId}:m)}:g)}));setToast('Milestone added to Mission Control · complete it there to earn XP')}}/>}
  {page==='Evolution'&&<PersonalEvolution records={data.evolution} xp={data.xp} onChange={records=>setData(d=>({...d,evolution:records as Item[]}))} onAwardXp={amount=>setData(d=>({...d,xp:d.xp+amount}))} onCreateMission={(title,description)=>{const mission={id:id(),title,created:new Date().toISOString(),description,category:'Personal',difficulty:'Easy',priority:'Medium',xp:30,deadline:'',status:'Available',done:false};setData(d=>({...d,missions:[mission,...d.missions]}));setToast('Growth mission created in Mission Control')}} onScheduleHabit={(title,category)=>{const task={id:id(),title,created:new Date().toISOString(),date:today(),category,priority:'Medium',done:false,startTime:'',durationMinutes:15,notes:'Habit practice scheduled from Personal Evolution'};setData(d=>({...d,tasks:[task,...d.tasks]}));setToast('Habit added to Daily Planner')}}/>}
 {page==='Knowledge'&&<KnowledgeLibrary courses={data.knowledge} credits={data.credits} onChange={courses=>setData(d=>({...d,knowledge:courses as Item[]}))} onEconomy={(courses,credits,xp)=>setData(d=>({...d,knowledge:courses as Item[],credits,xp:d.xp+xp}))}/>}
 {page==='Videos'&&<VideoLearningStudio videos={data.videos} courses={data.knowledge} onChange={videos=>setData(d=>({...d,videos:videos as Item[]}))} onOpenKnowledge={()=>setPage('Knowledge')}/>}
 {page==='Rewards'&&<RewardsAchievements rewards={data.rewards as any[]} xp={data.xp} credits={data.credits} metrics={rewardMetrics(data)} claimedAchievements={data.achievementClaims} unlockedItems={data.unlockedItems} onUnlock={unlockSystemReward} onSaveReward={reward=>setData(d=>({...d,rewards:d.rewards.some(r=>r.id===reward.id)?d.rewards.map(r=>r.id===reward.id?reward as Item:r):[reward as Item,...d.rewards]}))} onDeleteReward={rewardId=>setData(d=>({...d,rewards:d.rewards.filter(r=>r.id!==rewardId)}))} onRedeem={redeemPersonal} onFulfill={fulfillPersonal} onClaimAchievement={claimRewardAchievement}/>}
 {page==='Journal'&&<PersonalJournal entries={data.journal} onChange={entries=>setData(d=>({...d,journal:entries as Item[]}))}/>}
 {page==='Reports'&&<SystemReports data={data}/>}
 {page==='Settings'&&<SettingsSecurity data={data} storageHealthy={storageHealthy} notificationAccess={notificationAccess} onRequestNotifications={async()=>{const access=await requestNotificationAccess();setNotificationAccess(access);if(access==='granted'){sendSystemNotification('ASTERIA notifications enabled','ASTERIA can now show browser notifications.');setToast('Notifications enabled')}else if(access==='denied')setToast('Notifications are blocked in browser settings')}} onRestore={(restored,warning)=>{setPersistenceReady(true);setData(restored as Data);setToast(warning||'Backup restored successfully')}} onReset={()=>{const result=clearStoredAppData();if(!result.ok){setToast(result.error);return;}setPersistenceReady(true);setData(blank);setToast('Local data reset')}}/>}
 </div><footer>ASTERIA · PRIVATE · LOCAL-FIRST</footer></main>
 {modal&&<RecordModal page={modal} title={labels[modal]||modal} initial={editing} defaultDate={plannerDate} close={()=>{setModal(null);setEditing(null)}} save={f=>save(modal,f)}/>}
 {toast&&<div className="toast">✓　{toast}</div>}
 <div className="search"><input placeholder="Filter current section..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')}><X size={13}/></button>}</div>
 </div>
}
function Head({page,onAdd}:{page:Page;onAdd?:()=>void}){return <div className="head"><div><small>UNIVERSAL LIFE SYSTEM / {page.toUpperCase()}</small><h1>{labels[page]}</h1><p>Plan deliberately. Execute consistently. Review honestly.</p></div>{onAdd&&<button className="primary" onClick={onAdd}><Plus size={15}/> ADD NEW</button>}</div>}
export default App;
