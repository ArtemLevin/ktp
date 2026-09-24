(function(){
'use strict';
const rows={'5-math-vilenkin':{min:0,max:12},'6-math-vilenkin':{min:0,max:9},'7-geometry-atanasyan':{min:0,max:5},'8-geometry-atanasyan':{min:0,max:4},'9-geometry-atanasyan':{min:0,max:6},'10-geometry-atanasyan':{min:0,max:3},'7-algebra-makarychev':{min:0,max:6},'8-algebra-makarychev':{min:0,max:6},'9-algebra-makarychev':{min:0,max:5},'10-algebra-alimov':{min:0,max:7},'11-algebra-alimov':{min:0,max:6}};
const body=document.body,row=body?.dataset?.row,i=Number(body?.dataset?.topic),cfg=rows[row];
if(!cfg||!Number.isInteger(i)||i<cfg.min||i>cfg.max)return;

function inject(){
  if(document.querySelector('[data-assessment-topic-link]'))return true;
  const side=document.querySelector('.side-stack');
  if(!side)return false;
  const n=String(i+1).padStart(2,'0');
  const card=document.createElement('section');
  card.className='card';
  card.dataset.assessmentTopicLink='true';
  card.innerHTML='<span class="kicker">Проверочные материалы</span><h2>6 вариантов каждого типа</h2><p>Распечатайте отдельный вариант или весь комплект. Ответы и критерии доступны в режиме учителя.</p><a class="cta" href="../../assessments/'+row+'/'+n+'/independent.html">Самостоятельная работа →</a> <a class="cta" href="../../assessments/'+row+'/'+n+'/control.html">Контрольная работа →</a>';
  side.insertBefore(card,side.children[1]||null);
  return true;
}

window.KTP_INJECT_TOPIC_ASSESSMENTS=inject;

// Topic pages are rendered by another synchronous module. Keep a short-lived
// observer until window.load so the shared card survives any late DOM render
// without duplicating topic-specific link logic.
const observer=new MutationObserver(()=>inject());
observer.observe(document.documentElement,{childList:true,subtree:true});
inject();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});
window.addEventListener('load',()=>{inject();observer.disconnect();},{once:true});
})();