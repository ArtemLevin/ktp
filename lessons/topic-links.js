(function(){
'use strict';
const body=document.body;
if(body.dataset.row!=='7-algebra-makarychev'||Number(body.dataset.topic)!==0)return;
const side=document.querySelector('.side-stack');
if(!side)return;
const card=document.createElement('section');
card.className='card';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>18 последовательных уроков</h2><p>Первая тема разложена на 6 учебных недель. Для каждого урока доступны теория, примеры, тренировка, домашняя работа и проверочные варианты.</p><a class="cta" href="../../lessons/7-algebra-makarychev/01/index.html">Открыть 18 уроков →</a>';
side.insertBefore(card,side.children[1]||null);
})();
