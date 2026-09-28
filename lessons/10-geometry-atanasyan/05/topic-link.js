(function(){
'use strict';
const body=document.body;
if(body.dataset.row!=='10-geometry-atanasyan'||Number(body.dataset.topic)!==4)return;
const side=document.querySelector('.side-stack');if(!side)return;
if(side.querySelector('[data-topic05-lessons]'))return;
const card=document.createElement('section');
card.className='card';
card.dataset.topic05Lessons='true';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>8 итоговых уроков</h2><p>Уроки 61–68 курса: объёмы, практическое моделирование, сечения, признаки, расстояния и углы, комплексная задача, диагностика и адресная коррекция.</p><a class="cta" href="../../lessons/10-geometry-atanasyan/05/index.html">Открыть 8 уроков →</a>';
side.insertBefore(card,side.children[1]||null);
})();