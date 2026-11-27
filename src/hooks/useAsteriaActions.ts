import type { Dispatch, SetStateAction } from "react";
import { assignMissionToPlanner, missionReward, transitionMission, normalizeMission } from "../core/missions";
import { claimAchievement, redeemPersonalReward, fulfillPersonalReward, unlockSystemItem } from "../core/rewards";
import { rewardMetrics, id, today, type Data, type Item } from "../core/appData";
import { awardProgression } from "../core/progression";

type SetData = Dispatch<SetStateAction<Data>>;
type SetToast = Dispatch<SetStateAction<string>>;

/** Coordinates cross-module life-system actions while domain rules stay in core modules. */
export function useAsteriaActions(setData: SetData, setToast: SetToast) {
 const changeMissionStatus=(missionId:string,next:'Active'|'Available')=>{
   setData(d=>{const result=transitionMission(d.missions,missionId,next);if(!result.ok){setToast(result.reason);return d;}setToast(result.reason);return {...d,missions:result.missions};});
  };
  const completeMission=(missionId:string)=>{
   setData(d=>{const current=d.missions.find(m=>m.id===missionId);if(!current){setToast('Mission not found');return d;}const normalized=normalizeMission(current);if(normalized.status!=='Active'){setToast('Activate this mission before completing it');return d;}const result=transitionMission(d.missions,missionId,'Completed');if(!result.ok){setToast(result.reason);return d;}const reward=missionReward(normalized);const paid=awardProgression(d,'mission:'+missionId,'Mission completed',reward.xp,reward.credits);if(!paid.awarded){setToast('Mission status updated; reward was already recorded');return {...d,missions:result.missions};}setToast('Mission completed · '+reward.xp+' XP and '+reward.credits+' credits awarded');return {...d,missions:result.missions,...paid.state};});
  };
  const addMissionToPlanner=(missionId:string)=>{
   setData(d=>{const result=assignMissionToPlanner(d.missions,d.tasks as any,missionId,today(),id());if(!result.ok){setToast(result.reason);return d;}setToast('Mission added to Daily Planner · no reward is awarded for assignment');return {...d,tasks:result.tasks};});
  };
  const claimRewardAchievement=(achievementId:string)=>{
   setData(d=>{const result=claimAchievement(rewardMetrics(d),d.achievementClaims,achievementId);if(!result.ok){setToast(result.reason);return d;}const paid=awardProgression(d,'achievement:'+achievementId,'Achievement claimed',result.xp,result.credits);if(!paid.awarded){setToast('Achievement reward was already recorded');return d;}setToast('Achievement claimed · +'+result.credits+' credits · +'+result.xp+' XP');return {...d,achievementClaims:result.claimed,...paid.state};});
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
 return { changeMissionStatus, completeMission, addMissionToPlanner, claimRewardAchievement, unlockSystemReward, redeemPersonal, fulfillPersonal };
}
