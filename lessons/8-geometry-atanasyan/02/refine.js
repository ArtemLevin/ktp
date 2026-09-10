(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;
const lesson=(S.lessons||[]).find(x=>x.globalNumber===25);if(!lesson)return;
const fix=t=>{if(!t||!String(t.text||'').startsWith('Квадрат имеет диагональ'))return;const m=String(t.answer||'').match(/^(\d+) см²$/);if(!m)return;const side=Math.sqrt(Number(m[1]));if(Number.isInteger(side))t.text=`Квадрат имеет сторону ${side} см. Найдите его площадь.`;};
for(const t of lesson.practice||[])fix(t);for(const t of lesson.homework?.required||[])fix(t);for(const t of lesson.homework?.optional||[])fix(t);for(const kind of ['independent','control'])for(const v of lesson[kind]?.variants||[])for(const t of v.tasks||[])fix(t);
})();