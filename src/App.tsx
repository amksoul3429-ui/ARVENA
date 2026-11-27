import {useEffect,useRef,useState} from 'react';
import {useAsteriaData} from './hooks/useAsteriaData';
import NavigationOverlay from './components/NavigationOverlay';
import {labels,type Page} from './core/navigation';
import type {RecordPage} from './core/records';
import {useAsteriaActions} from './hooks/useAsteriaActions';
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
import {removeMissionTasks} from './core/planner';
import {saveRecord} from './core/records';
import {filterWorkspaceRecords,removeWorkspaceRecord} from './core/workspaceData';
import {normalizeMission} from './core/missions';
import type { LifeGoal, GoalMilestone } from './core/goals';
import './components/MissionControl.css';
import {getLevel,xpIntoLevel} from './core/system';
import {clearStoredAppData,restoreAppData} from './core/storage';
import {getNotificationAccess,requestNotificationAccess,sendSystemNotification} from './core/permissions';
import {Menu,Plus,Wallet,X,Zap,Sun,Moon} from 'lucide-react';
function App(){
 const {data,setData,setPersistenceReady,storageHealthy,persistenceError,loadError,loadWarning}=useAsteriaData();
 const[notificationAccess,setNotificationAccess]=useState(getNotificationAccess);
 const[theme,setTheme]=useState<'dark'|'light'>(()=>{try{return (window.localStorage.getItem('asteria-theme')||window.localStorage.getItem('arvena-theme'))==='light'?'light':'dark'}catch{return 'dark'}});
 const[page,setPage]=useState<Page>('Overview'),[modal,setModal]=useState<RecordPage|null>(null),[editing,setEditing]=useState<Item|null>(null),[plannerDate,setPlannerDate]=useState(today()),[mobile,setMobile]=useState(false),[toast,setToast]=useState(loadWarning||loadError),[search,setSearch]=useState('');
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
 const open=(p:RecordPage,item?:Item)=>{focusReturnRef.current=document.activeElement as HTMLElement|null;setEditing(item||null);setModal(p)};
 const openPlanner=(date:string)=>{setPlannerDate(date);open('Planner')};
 const remove=(p:RecordPage,item:Item)=>{setData(d=>removeWorkspaceRecord(d,p,item.id));setToast('Deleted')};
 const save=(p:RecordPage,form:HTMLFormElement)=>{setData(d=>saveRecord(d,p,new FormData(form),editing));setModal(null);setEditing(null);setToast(editing?'Saved changes':'Added successfully')};
 const {changeMissionStatus,completeMission,addMissionToPlanner,claimRewardAchievement,unlockSystemReward,redeemPersonal,fulfillPersonal}=useAsteriaActions(setData,setToast);
 const list=(p:Page)=>filterWorkspaceRecords(data,p,search);
 return <div className="shell">
 {mobile&&<NavigationOverlay page={page} xp={data.xp} onNavigate={setPage} onClose={()=>setMobile(false)}/>}
 <main><header><button className="hamb" aria-label="Open navigation" aria-expanded={mobile} aria-controls="asteria-navigation-dialog" onClick={()=>{focusReturnRef.current=document.activeElement as HTMLElement|null;setMobile(true)}}><Menu/></button><span>ASTERIA　›　<b>{labels[page].toUpperCase()}</b></span><div className="chips"><button className="theme-toggle" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'}>{theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}<span>{theme==='dark'?'LIGHT':'DARK'}</span></button><i><Wallet size={14}/> {data.credits} credits</i><i><Zap size={14}/> LVL {getLevel(data.xp)}</i></div></header>
 <div className="content">
 {page==='Explore'&&<UniversalExplorer videos={data.videos as any[]} onChange={videos=>setData(d=>({...d,videos:videos as unknown as Item[]}))}/>}
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
 {page==='Settings'&&<SettingsSecurity data={data} storageHealthy={storageHealthy} notificationAccess={notificationAccess} onRequestNotifications={async()=>{const access=await requestNotificationAccess();setNotificationAccess(access);if(access==='granted'){sendSystemNotification('ASTERIA notifications enabled','ASTERIA can now show browser notifications.');setToast('Notifications enabled')}else if(access==='denied')setToast('Notifications are blocked in browser settings')}} onRestore={(restored,warning)=>{const result=restoreAppData(restored);if(!result.ok){setToast(result.error);return;}setPersistenceReady(true);setData(result.value as Data);setToast(warning||'Backup restored successfully')}} onReset={()=>{const result=clearStoredAppData();if(!result.ok){setToast(result.error);return;}setPersistenceReady(true);setData(blank);setToast('Local data reset')}}/>}
 </div><footer>ASTERIA · PRIVATE · LOCAL-FIRST</footer></main>
 {modal&&<RecordModal page={modal} title={labels[modal]||modal} initial={editing} defaultDate={plannerDate} close={()=>{setModal(null);setEditing(null)}} save={f=>save(modal,f)}/>}
 {toast&&<div className="toast">✓　{toast}</div>}
 <div className="search"><input placeholder="Filter current section..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')}><X size={13}/></button>}</div>
 </div>
}
function Head({page,onAdd}:{page:Page;onAdd?:()=>void}){return <div className="head"><div><small>UNIVERSAL LIFE SYSTEM / {page.toUpperCase()}</small><h1>{labels[page]}</h1><p>Plan deliberately. Execute consistently. Review honestly.</p></div>{onAdd&&<button className="primary" onClick={onAdd}><Plus size={15}/> ADD NEW</button>}</div>}
export default App;
