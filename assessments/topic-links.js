(function(){
'use strict';
const body=document.body;
const rows={
  '7-algebra-makarychev':{min:0,max:6},
  '11-algebra-alimov':{min:0,max:5}
};
const row=body.dataset.row,i=Number(body.dataset.topic),cfg=rows[row];
if(!cfg||!Number.isInteger(i)||i<cfg.min||i>cfg.max)return;
const side=document.querySelector('.side-stack');
if(!side)return;
const n=String(i+1).padStart(2,'0');
const card=document.createElement('section');
card.className='card';
card.innerHTML=`<span class="kicker">Проверочные материалы</span><h2>6 вариантов каждого типа</h2><p>Распечатайте отдельный вариант или весь комплект. Ответы и критерии доступны в режиме учителя.</p><a class="cta" href="../../assessments/${row}/${n}/independent.html">Самостоятельная работа →</a> <a class="cta" href="../../assessments/${row}/${n}/control.html">Контрольная работа →</a>`;
side.insertBefore(card,side.children[1]||null);
})();