(()=>{'use strict';
const style=document.createElement('style');style.textContent=`
.exam-head .status{display:none!important}#pteCompletionStamp{display:block!important;margin-left:auto;white-space:nowrap;color:#008a51;font-weight:700}#pteCompletionStamp[hidden]{display:none!important}
#pteResourceWrap{margin-left:auto;position:relative;z-index:60;flex-shrink:0;font:13px system-ui}
#pteResourceBtn{border:1px solid #ddd6fe;background:linear-gradient(135deg,#f2efff,#e9e3ff);color:#4f2bc8;border-radius:13px;padding:11px 15px;font-weight:800;box-shadow:0 3px 12px #4834ac14;cursor:pointer}
#pteResourceMenu{position:absolute;right:0;top:calc(100% + 8px);min-width:235px;max-width:90vw;background:#fff;border:1px solid #e5e2f4;box-shadow:0 20px 55px #14173530;border-radius:15px;padding:8px;z-index:80}
#pteResourceMenu[hidden],#pteResourceViewer[hidden]{display:none!important}
#pteResourceMenu button{width:100%;background:transparent;border:0;border-radius:9px;padding:12px;text-align:left;color:#24314b;font-weight:700;cursor:pointer}#pteResourceMenu button:hover{background:#f2efff;color:#5634db}
#pteResourceViewer{position:fixed;inset:0;z-index:99999;background:#10172bdc;display:flex;align-items:center;justify-content:center;padding:12px}
#pteResourceViewer .rv-inner{width:min(1200px,98vw);height:min(850px,94vh);background:#fff;border-radius:19px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 80px #0006}
#pteResourceViewer .rv-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:15px 17px;border-bottom:1px solid #edf0f6}
#pteResourceViewer .rv-title{font-size:15px;font-weight:900;color:#222a45}#pteResourceViewer .rv-sub{font-size:11px;color:#7b8499;margin-top:3px}
#pteResourceViewer .rv-close{background:#f5f6fb;border:1px solid #e4e7f0;border-radius:10px;padding:9px 12px;cursor:pointer;font-weight:800}
#pteResourceViewer .rv-tabs{display:flex;gap:7px;overflow:auto;padding:10px 14px;background:#fafaff;border-bottom:1px solid #eae7f6}
#pteResourceViewer .rv-tabs button{white-space:nowrap;border:1px solid #e7e3f5;background:white;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:800;color:#5a6275;cursor:pointer}
#pteResourceViewer .rv-tabs button.active{background:#6337ed;color:white;border-color:#6337ed}
#pteResourceViewer .rv-body{flex:1;min-height:0;display:flex;align-items:stretch;justify-content:center;background:#f8f9ff;position:relative}
#pteResourceViewer .rv-body iframe{height:100%;width:100%;border:0;background:white}
#pteResourceViewer .rv-body img{height:100%;width:100%;object-fit:contain}
#pteResourceViewer .rv-footer{padding:9px 15px;border-top:1px solid #edf0f6;display:flex;justify-content:space-between;align-items:center;gap:12px;font:11px system-ui;color:#677085}
#pteResourceViewer .rv-footer a{color:#5936da;font-weight:800;text-decoration:none}
@media(max-width:640px){#pteResourceViewer{padding:4px}#pteResourceViewer .rv-inner{height:96vh;width:100vw;border-radius:12px}.exam-head{flex-wrap:wrap}#pteResourceBtn{padding:9px 11px}}
`;document.head.append(style);
const wrap=document.createElement('div');wrap.id='pteResourceWrap';wrap.hidden=true;wrap.innerHTML='<button type="button" id="pteResourceBtn" aria-haspopup="true" aria-expanded="false">📚 Resources ▾</button><div id="pteResourceMenu" hidden></div>';
const viewer=document.createElement('div');viewer.id='pteResourceViewer';viewer.hidden=true;viewer.innerHTML='<div class="rv-inner" role="dialog" aria-modal="true" aria-label="Question resources"><div class="rv-top"><div><div class="rv-title" id="rvTitle">Learning resources</div><div class="rv-sub">Switch between resources without closing this window</div></div><button class="rv-close" type="button" id="rvClose">✕ Close</button></div><div class="rv-tabs" id="rvTabs"></div><div class="rv-body" id="rvBody"></div><div class="rv-footer"><span>Some websites block embedded viewing.</span><a id="rvExternal" target="_blank" rel="noopener noreferrer">Open original ↗</a></div></div>';document.body.append(viewer);
const $=id=>document.getElementById(id);let items=[],signature='',currentIndex=0;
function validUrl(raw){try{const u=new URL(String(raw||'').trim());return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}}
function youtubeId(raw){try{const u=new URL(raw),h=u.hostname.replace(/^www\./,'').toLowerCase();if(h==='youtu.be')return u.pathname.split('/')[1];if(['youtube.com','m.youtube.com','youtube-nocookie.com','music.youtube.com'].includes(h))return u.searchParams.get('v')||(u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)||[])[1]}catch{}return null}
function driveId(raw){try{const u=new URL(raw);if(!/(^|\.)drive\.google\.com$/.test(u.hostname))return null;return (u.pathname.match(/\/file\/d\/([^/]+)/)||[])[1]||u.searchParams.get('id')}catch{return null}}
function embedUrl(item){const id=driveId(item.url);if(item.kind==='youtube'){const y=youtubeId(item.url);return y?'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(y)+'?rel=0':item.url}if(id)return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';return item.url}
function close(){viewer.hidden=true;$('rvBody').replaceChildren()}
$('rvClose').onclick=close;viewer.onclick=e=>{if(e.target===viewer)close()};document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
function show(index){currentIndex=index;const item=items[index];if(!item)return;const body=$('rvBody');body.replaceChildren();$('rvTitle').textContent=item.title||item.label;$('rvExternal').href=item.url;for(const [j,b] of Array.from($('rvTabs').children).entries())b.classList.toggle('active',j===index);let el;if(item.kind==='image'&&!driveId(item.url)){el=document.createElement('img');el.alt=item.label;el.src=item.url}else{el=document.createElement('iframe');el.title=item.label;el.src=embedUrl(item);el.referrerPolicy='strict-origin-when-cross-origin';el.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';el.allowFullscreen=true}body.append(el)}
function open(index){$('rvTabs').replaceChildren();items.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.textContent=item.label;b.onclick=()=>show(i);$('rvTabs').append(b)});viewer.hidden=false;show(index)}
function active(){try{const ctx=window.PTEProgress?.currentItem?.();const qid=String(ctx?.questionId||'');if(typeof DATA!=='undefined'&&typeof task!=='undefined'){const bank=DATA?.[task]?.questions||[];return bank[typeof idx!=='undefined'?idx:0]||bank.find(x=>String(x.id)===qid)||null}}catch{}try{if(typeof task!=='undefined'&&typeof DATA!=='undefined')return DATA?.[task]?.questions?.[typeof idx!=='undefined'?idx:0]||null}catch{}try{if(typeof qs!=='undefined'&&typeof idx!=='undefined')return qs?.[idx]||null}catch{}return window.PTEProgress?.currentQuestion?.()||null}
function gather(q){const result=[];if(!q)return result;const specs=[
 ['resourcePdfUrl','📄 PDF','pdf'],
 ['resourceYoutubeUrl','▶ YouTube','youtube'],
 ['resourceImageUrl','🖼 Image','image'],
 ['resourceWebUrl','🌐 Web page','web'],
 ['resourceUrl','🔗 Resource','auto'],
 ['resources','🔗 Resources','auto'],
 ['resourceLink','🔗 Resource link','auto'],
 ['referenceUrl','🔗 Reference','auto'],
 ['studyMaterial','📚 Study material','auto']
];const seen=new Set();for(const [field,label,kind] of specs){const snake=field.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());
const raw=String(q[field]||q[snake]||q[field.toLowerCase()]||'');for(const entry of raw.split(/[|\n,;]+/)){const u=validUrl(entry);if(!u||seen.has(u))continue;seen.add(u);let type=kind;if(type==='auto')type=youtubeId(u)?'youtube':/\.(png|jpe?g|gif|webp)(\?|$)/i.test(u)?'image':/\.pdf(\?|$)/i.test(u)?'pdf':'web';result.push({url:u,kind:type,label,title:String(q.resourceTitle||q.resourceName||q.learningResourceTitle||'').trim()||label})}}return result}
function update(){const head=document.querySelector('.exam-head')||document.querySelector('.title-row');if(!head)return;if(wrap.parentElement!==head){const status=head.querySelector('.status');if(status)status.insertAdjacentElement('afterend',wrap);else head.append(wrap)}const q=active();items=gather(q);wrap.hidden=false;wrap.style.display='block';const menu=$('pteResourceMenu');menu.hidden=true;$('pteResourceBtn').setAttribute('aria-expanded','false');menu.replaceChildren();if(!items.length){const empty=document.createElement('div');empty.style.cssText='padding:12px;color:#64748b;font-size:12px';empty.textContent='No resources added for this question';menu.append(empty)}items.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.textContent=item.label;b.onclick=()=>{menu.hidden=true;open(i)};menu.append(b)});if(!viewer.hidden){if(items.length){$('rvTabs').replaceChildren();items.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.textContent=item.label;b.onclick=()=>show(i);$('rvTabs').append(b)});show(Math.min(currentIndex,items.length-1))}else close()}}
$('pteResourceBtn').onclick=()=>{const menu=$('pteResourceMenu');menu.hidden=!menu.hidden;$('pteResourceBtn').setAttribute('aria-expanded',String(!menu.hidden))};document.addEventListener('click',e=>{if(!wrap.contains(e.target))$('pteResourceMenu').hidden=true});
setInterval(()=>{const q=active();const next=[typeof task!=='undefined'?task:'',typeof idx!=='undefined'?idx:'',q?.id||'',q?.resourcePdfUrl||'',q?.resourceYoutubeUrl||'',q?.resourceImageUrl||'',q?.resourceWebUrl||'',q?.resourceUrl||''].join('|');if(next!==signature){signature=next;update()}},300);
window.addEventListener('load',update);window.addEventListener('pte:cloud-updated',update);window.addEventListener('pte:progress-changed',update);window.PTEResources={refresh:update};
})();