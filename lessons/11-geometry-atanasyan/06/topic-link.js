(function(){
'use strict';
if(document.body.dataset.row!=='11-geometry-atanasyan'||Number(document.body.dataset.topic)!==5)return;
const side=document.querySelector('.side-stack');
if(!side||side.querySelector('[data-review-lesson-link]'))return;
const card=document.createElement('section');card.className='card';card.dataset.reviewLessonLink='true';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>12 последовательных уроков</h2><p>Итоговое повторение, комплексная диагностика и адресная коррекция по слабым доменам. В каждом уроке — три примера, тренировка, ДЗ 6+2 и шесть вариантов каждой поурочной проверки.</p><a class="cta" href="../../lessons/11-geometry-atanasyan/06/index.html">Открыть уроки 57–68 →</a>';
side.insertBefore(card,side.children[1]||null);
})();
