(function(){
'use strict';
const body=document.body;
if(body.dataset.row!=='10-geometry-atanasyan'||Number(body.dataset.topic)!==3)return;
const side=document.querySelector('.side-stack');if(!side)return;
const card=document.createElement('section');
card.className='card';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>18 последовательных уроков</h2><p>Уроки 43–60 курса: многогранники, призмы и пирамиды, сечения, симметрия, Эйлер, поверхности, объёмы и подобные тела.</p><a class="cta" href="../../lessons/10-geometry-atanasyan/04/index.html">Открыть 18 уроков →</a>';
side.insertBefore(card,side.children[1]||null);

})();