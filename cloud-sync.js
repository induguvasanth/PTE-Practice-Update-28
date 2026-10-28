(()=>{'use strict';
const STORE='pte_progress_v4';let busy=false,pending=false,timer;const uploaded=new Map();
const read=()=>{try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch{return []}};
const task=r=>String(r.task||String(r.item||'').split(' / ')[0]||r.module||'').trim().replace(/[^a-zA-Z0-9_.:-]/g,'_').slice(0,120);
const qid=r=>String(r.questionId||r.item||'').trim().replace(/[^a-zA-Z0-9_.:-]/g,'_').slice(0,120);
const canon=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const catalog=()=>window.PTEProgress?.getCatalog?.()||[];
function resolveRemote(r,sid,localRows){
 const t=canon(r.task),id=String(r.questionId||'').trim();
 const existing=localRows.find(x=>String(x.studentId)===sid&&canon(task(x))===t&&qid(x)===id);
 if(existing)return existing;
 const candidates=catalog().filter(x=>canon(String(x.item||'').split(' / ')[0])===t&&String(x.questionId)===id);
 if(candidates.length===1)return candidates[0];
 const numeric=/^\d+$/.test(id)?Number(id):0;
 if(numeric>0){const numbered=catalog().filter(x=>canon(String(x.item||'').split(' / ')[0])===t&&x.item.endsWith(' / Question '+numeric));if(numbered.length===1)return numbered[0]}
 return null;
}
const key=(sid,t,q)=>[sid,t,q].join('|');
const validScore=s=>s!==null&&s!==undefined&&s!==''&&Number.isFinite(Number(s));
const date=s=>{const n=Date.parse(s||'');return Number.isFinite(n)?n:0};
const status=r=>r.finished||r.status==='finished'?'finished':'attempted';
const show=(message,problem=false)=>{window.PTECloudStatus={message,problem};window.dispatchEvent(new CustomEvent('pte:sync-status',{detail:window.PTECloudStatus}));};
function fromRemote(r,sid,old){
 const sw=new Set('personalIntroduction readAloud repeatSentence describeImage retellLecture answerShortQuestion summarizeGroupDiscussion respondSituation summarizeWrittenText essay'.split(' '));
 const rd=new Set('readingRWBlanks readingMCQMultiple reorderParagraph readingBlanks readingMCQSingle'.split(' '));
 const li=new Set('summarizeSpoken listeningMCQMultiple listeningBlanks highlightSummary listeningMCQSingle missingWord incorrectWords dictation'.split(' '));
 const t=String(r.task||'');
 const module=sw.has(t)?'Speaking & Writing':rd.has(t)?'Reading':li.has(t)?'Listening':/^grammar/i.test(t)?'Grammar':/^vocabulary/i.test(t)?'Vocabulary':old?.module||t;
 return {studentId:sid,module:module,item:old?.item||t+' / Question '+r.questionId,questionId:String(r.questionId),task:t,finished:r.status==='finished',score:validScore(r.score)?Number(r.score):null,completedAt:r.completedAt||old?.completedAt||null,updatedAt:r.updatedAt||''};
}
async function sync(){const user=window.PTEAuth?.session();if(!user)return;if(busy){pending=true;return}busy=true;show('Retrieving progress from Google Sheets…');try{
const sid=String(user.studentId);const before=read();
const response=await window.PTEAuth.request('read',{action:'studentProgress',studentId:sid,studentToken:user.studentToken});
if(!response?.ok)throw Error(response?.error||'Sheet retrieval failed');
if(window.PTEAuth?.session()?.studentId!==sid)return;
const remote=new Map((response.records||[]).map(r=>[key(sid,String(r.task),String(r.questionId)),r]));
const local=new Map(before.filter(r=>String(r.studentId)===sid).map(r=>[key(sid,task(r),qid(r)),r]));
const merged=new Map();const toUpload=[];
for(const [k,r] of remote){const old=local.get(k)||resolveRemote(r,sid,before);const cloud=fromRemote(r,sid,old);let result=cloud;
if(old){const newer=date(old.updatedAt)>date(r.updatedAt);if(newer){result={...old,finished:!!old.finished||cloud.finished,score:validScore(old.score)?old.score:cloud.score,completedAt:old.completedAt||cloud.completedAt};if(result.finished!==cloud.finished||String(result.score??'')!==String(cloud.score??''))toUpload.push(result)}else if(cloud.finished&& !validScore(cloud.score)&&validScore(old.score)){result={...cloud,score:old.score};toUpload.push(result)}}
merged.set(k,result)}
for(const [k,r] of local)if(!merged.has(k)&&![...merged.values()].some(x=>x.module===r.module&&x.item===r.item)){merged.set(k,r);toUpload.push(r)}
const other=before.filter(r=>String(r.studentId)!==sid);
localStorage.setItem(STORE,JSON.stringify([...other,...merged.values()]));window.PTEProgress?.refresh();window.dispatchEvent(new Event('pte:cloud-updated'));
show('Retrieved '+remote.size+' saved questions. Saving '+toUpload.length+' new updates…');
for(const r of toUpload){if(window.PTEAuth?.session()?.studentId!==sid)return;const t=task(r),q=qid(r);if(!t||!q)continue;const k=key(sid,t,q),sig=JSON.stringify([r.updatedAt,status(r),r.score]);if(uploaded.get(k)===sig)continue;
const result=await window.PTEAuth.request('write',{action:'saveQuestionProgress',studentId:sid,studentToken:user.studentToken,task:t,questionId:q,status:status(r),score:validScore(r.score)?Number(r.score):''});if(!result?.ok)throw Error(result?.error||'Sheet save failed');uploaded.set(k,sig)}
show('Progress synced with Google Sheets');
}catch(e){console.warn('[PTE Cloud Sync]',e);show('Sync failed: '+(e?.message||e),true)}finally{busy=false;if(pending){pending=false;setTimeout(sync,600)}}}
const schedule=()=>{clearTimeout(timer);timer=setTimeout(sync,500)};
window.addEventListener('pte:progress-changed',schedule);window.addEventListener('pte:student-changed',()=>{uploaded.clear();schedule()});window.addEventListener('online',schedule);window.PTECloud={sync,pull:sync,push:sync};setTimeout(schedule,900);
})();
