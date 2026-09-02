(function(){
'use strict';
const body=document.body;
if(body.dataset.row!=='7-algebra-makarychev')return;
const i=Number(body.dataset.topic);
if(!Number.isInteger(i)||i<0||i>6)return;
const side=document.querySelector('.side-stack');
if(!side)return;
const n=String(i+1).padStart(2,'0');
const card=document.createElement('section');
card.className='card';
card.innerHTML=`<span class="kicker">Проверочные материалы</span><h2>6 вариантов каждого типа</h2><p>Распечатайте отдельный вариант или весь комплект. Ответы и критерии доступны в режиме учителя.</p><a class="cta" href="../../assessments/7-algebra-makarychev/${n}/independent.html">Самостоятельная работа →</a> <a class="cta" href="../../assessments/7-algebra-makarychev/${n}/control.html">Контрольная работа →</a>`;
side.insertBefore(card,side.children[1]||null);
})();