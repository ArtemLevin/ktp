(function(){
'use strict';
if(document.body.dataset.row!=='11-geometry-atanasyan'||Number(document.body.dataset.topic)!==3)return;
const side=document.querySelector('.side-stack');
if(!side||side.querySelector('[data-vector-lesson-link]'))return;
const card=document.createElement('section');card.className='card';card.dataset.vectorLessonLink='true';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>12 последовательных уроков</h2><p>Направления, операции, многогранники, компланарность и разложение. В каждом уроке — три примера, тренировка, ДЗ 6+2 и шесть вариантов каждой поурочной проверки.</p><a class="cta" href="../../lessons/11-geometry-atanasyan/04/index.html">Открыть уроки 33–44 →</a>';
side.insertBefore(card,side.children[1]||null);
})();
