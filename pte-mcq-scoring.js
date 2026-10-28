/* Shared option-key matching and partial-credit grading (practice, not official Pearson scoring). */
(function(){'use strict';
const norm=x=>String(x??'').normalize('NFKC').toLowerCase().replace(/^[a-f][.)]\s*/i,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
function options(q){return (Array.isArray(q.options)?q.options:String(q.options||'').split('|')).map(x=>String(x).trim()).filter(Boolean)}
function resolve(x,opts){let s=String(x??'').trim();if(/^[a-f]$/i.test(s)&&opts.length)return norm(opts[s.toUpperCase().charCodeAt(0)-65]??s);if(/^\d+$/.test(s)&&opts.length){let i=Number(s);if(i>=1&&i<=opts.length)return norm(opts[i-1]);if(i===0)return norm(opts[0]);}return norm(s)}
function grade(q,selected){const opts=options(q);const keys=String(q.answer||'').split(/\s*(?:\|\|\||\||;|,)\s*/).filter(Boolean);const expected=new Set(keys.map(x=>resolve(x,opts)).filter(Boolean));const actual=new Set(selected.map(x=>resolve(x,opts)).filter(Boolean));let hit=0,wrong=0;actual.forEach(x=>expected.has(x)?hit++:wrong++);return {earned:Math.max(0,hit-wrong),possible:expected.size,hit,wrong,exact:hit===expected.size&&!wrong,percent:expected.size?Math.round(100*Math.max(0,hit-wrong)/expected.size):0,expected,actual};}
window.PTEMultiChoice={grade,resolve,options};
})();
