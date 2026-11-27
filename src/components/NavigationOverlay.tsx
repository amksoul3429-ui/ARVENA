import {Activity,BookOpen,CalendarDays,ChevronRight,Compass,Edit3,Flame,LayoutDashboard,Settings,Target,Trophy,Video as VideoIcon,X} from 'lucide-react';
import {getLevel} from '../core/system';
import {labels,type Page,sections} from '../core/navigation';

type Props={page:Page;xp:number;onNavigate:(page:Page)=>void;onClose:()=>void};
export default function NavigationOverlay({page,xp,onNavigate,onClose}:Props){
 const icons:Record<Page,typeof Compass>={Explore:Compass,Overview:LayoutDashboard,Missions:Target,Planner:CalendarDays,'Dream Life':Compass,Evolution:Activity,Knowledge:BookOpen,Videos:VideoIcon,Rewards:Trophy,Journal:Edit3,Reports:Flame,Settings};
 return <div className="navigation-layer" style={{position:'fixed',inset:0,zIndex:1000,display:'grid',placeItems:'center',padding:14,background:'rgba(2,7,19,.72)',backdropFilter:'blur(4px)'}} onClick={onClose}>
  <aside id="asteria-navigation-dialog" role="dialog" aria-modal="true" aria-label="ASTERIA navigation" className="sidebar navigation-panel" style={{position:'relative',inset:'auto',top:'auto',right:'auto',bottom:'auto',left:'auto',width:'min(380px, calc(100vw - 28px))',height:'auto',maxHeight:'calc(100dvh - 28px)',overflowX:'hidden',overflowY:'auto',display:'flex',flexDirection:'column',margin:0,padding:'22px 15px',border:'1px solid #3a4b68',borderRadius:20,transform:'none',visibility:'visible',opacity:1,pointerEvents:'auto',zIndex:1001,boxShadow:'0 24px 80px rgba(0,0,0,.42)'}} onClick={event=>event.stopPropagation()}>
   <div className="brand"><span><img src="./asteria-mark.svg" alt="ASTERIA mark"/></span><div><b>ASTERIA</b><small>PERSONAL SYSTEM</small></div><button className="close" aria-label="Close navigation" onClick={onClose}><X/></button></div>
   <div className="operator"><b>ASTERIA Operator</b><small>Level {getLevel(xp)} · {xp} XP</small></div>
   {sections.map(item=>{const Icon=icons[item];return <button key={item} className={'nav '+(page===item?'active':'')} onClick={()=>{onNavigate(item);onClose()}}><Icon size={17}/>{labels[item]}{page===item&&<ChevronRight size={14}/>}</button>})}
   <div className="sidefoot">● ASTERIA · LOCAL SYSTEM</div>
  </aside>
 </div>;
}
