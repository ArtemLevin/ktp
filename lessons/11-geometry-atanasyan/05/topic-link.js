(function(){
'use strict';
if(document.body.dataset.row!=='11-geometry-atanasyan'||Number(document.body.dataset.topic)!==4)return;
const side=document.querySelector('.side-stack');
if(!side||side.querySelector('[data-coordinate-lesson-link]'))return;
const card=document.createElement('section');card.className='card';card.dataset.coordinateLessonLink='true';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>12 последовательных уроков</h2><p>Координаты, длины, углы, расстояние и отдельное расширение KTP: движения. В каждом уроке — три примера, тренировка, ДЗ 6+2 и шесть вариантов каждой поурочной проверки.</p><a class="cta" href="../../lessons/11-geometry-atanasyan/05/index.html">Открыть уроки 45–56 →</a>';
side.insertBefore(card,side.children[1]||null);
})();
