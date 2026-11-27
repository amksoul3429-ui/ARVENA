/** Shared, idempotent progression economy for every ASTERIA workspace. */
export type ProgressionEvent = { id:string; title:string; created:string; kind:"progression"; source:string; xp:number; credits:number };
export type ProgressionState = { xp:number; credits:number; activity:unknown[] };
export function levelForXp(value:number){return Math.floor(Math.max(0,Math.floor(Number(value)||0))/500)+1;}
export function levelProgress(value:number){const xp=Math.max(0,Math.floor(Number(value)||0));return {level:levelForXp(xp),current:xp%500,required:500,percent:Math.round((xp%500)/5)};}
export function rankForLevel(level:number){const ranks=[{level:1,title:"Initiate"},{level:2,title:"Apprentice"},{level:3,title:"Pathfinder"},{level:5,title:"Strategist"},{level:8,title:"Specialist"},{level:12,title:"Vanguard"},{level:16,title:"Architect"},{level:20,title:"Sovereign"}];return [...ranks].reverse().find(r=>level>=r.level)||ranks[0];}
export function awardProgression(state:ProgressionState,eventId:string,source:string,xp:number,credits:number,now=new Date().toISOString()){
 const safeXp=Math.max(0,Math.floor(Number(xp)||0)),safeCredits=Math.max(0,Math.floor(Number(credits)||0));
 if(!eventId.trim())return {awarded:false,state,reason:"A stable reward event ID is required"};
 if(state.activity.some((entry:any)=>entry&&entry.kind==="progression"&&entry.id===eventId))return {awarded:false,state,reason:"This progression reward was already recorded"};
 if(!safeXp&&!safeCredits)return {awarded:false,state,reason:"A reward must contain XP or credits"};
 const event:ProgressionEvent={id:eventId,title:source,created:now,kind:"progression",source,xp:safeXp,credits:safeCredits};
 return {awarded:true,state:{xp:Math.max(0,Math.floor(state.xp||0))+safeXp,credits:Math.max(0,Math.floor(state.credits||0))+safeCredits,activity:[event,...state.activity]},event,reason:"Progression reward recorded"};
}
export function skillLevelFromPractice(minutes:number){return Math.min(10,1+Math.floor(Math.max(0,Math.floor(minutes||0))/300));}
export function skillProgress(minutes:number){const total=Math.max(0,Math.floor(minutes||0)),level=skillLevelFromPractice(total),within=total%300;return {level,minutesIntoLevel:within,minutesToNext:level>=10?0:300-within,percent:level>=10?100:Math.round(within/3)};}
