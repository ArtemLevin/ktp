(function(){
'use strict';
const body=document.body;
if(body.dataset.row!=='11-geometry-atanasyan'||Number(body.dataset.topic)!==1)return;
const side=document.querySelector('.side-stack');
if(!side)return;
const card=document.createElement('section');
card.className='card';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>10 последовательных уроков</h2><p>Объём как величина, призмы и пирамиды, рабочие сечения, подобие и прикладные модели. В каждом уроке — теория, примеры, тренировка и шесть вариантов каждой поурочной проверки.</p><a class="cta" href="../../lessons/11-geometry-atanasyan/02/index.html">Открыть уроки 12–21 →</a>';
side.insertBefore(card,side.children[1]||null);
})();