(function(){
'use strict';
const body=document.body;
if(body.dataset.row!=='10-geometry-atanasyan'||Number(body.dataset.topic)!==3)return;
const side=document.querySelector('.side-stack');if(!side)return;
const card=document.createElement('section');
card.className='card';
card.innerHTML='<span class="kicker">Поурочная подготовка</span><h2>18 последовательных уроков</h2><p>Уроки 43–60 курса: многогранники, призмы и пирамиды, сечения, симметрия, Эйлер, поверхности, объёмы и подобные тела.</p><a class="cta" href="../../lessons/10-geometry-atanasyan/04/index.html">Открыть 18 уроков →</a>';
side.insertBefore(card,side.children[1]||null);

// Release-safe fallback for the thematic assessment card. The shared
// assessments/topic-links.js remains authoritative for all other topics;
// its idempotency marker prevents a duplicate when it runs afterwards.
if(!document.querySelector('[data-assessment-topic-link]')){
  const assessment=document.createElement('section');
  assessment.className='card';
  assessment.dataset.assessmentTopicLink='true';
  assessment.innerHTML='<span class="kicker">Проверочные материалы</span><h2>6 вариантов каждого типа</h2><p>Распечатайте отдельный вариант или весь комплект. Ответы и критерии доступны в режиме учителя.</p><a class="cta" href="../../assessments/10-geometry-atanasyan/04/independent.html">Самостоятельная работа →</a> <a class="cta" href="../../assessments/10-geometry-atanasyan/04/control.html">Контрольная работа →</a>';
  side.insertBefore(assessment,side.children[2]||null);
}
})();