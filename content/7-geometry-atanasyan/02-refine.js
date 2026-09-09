(function(){
'use strict';
const c=window.KTP_CONTENT?.['7-geometry-atanasyan::1'];
if(!c)return;
const oldObjective='Использовать свойства равнобедренного треугольника и обратное рассуждение по равенству углов при основании.';
const newObjective='Использовать свойства равнобедренного треугольника: равенство углов при основании и свойство биссектрисы, проведённой к основанию.';
c.objectives=(c.objectives||[]).map(x=>x===oldObjective?newObjective:x);
const transfer=c.practice?.transfer||[];
const premature=transfer.find(x=>String(x.task||'').startsWith('В △ABC ∠B = ∠C.'));
if(premature){
  premature.task='Ученик рассуждает: «В △ABC углы B и C равны, значит AB = AC». Можно ли использовать такой вывод как уже изученное свойство в этой теме?';
  premature.answer='Пока нет. В главе II изучено направление AB = AC ⇒ ∠B = ∠C. Обратное утверждение будет обосновано позже, поэтому здесь нужен другой доказанный факт или дополнительное доказательство.';
}
const construction=(c.examples||[]).find(x=>x.title==='Построение середины отрезка');
if(construction){
  construction.check='AP = BP, AQ = BQ и PQ — общая сторона, поэтому △APQ = △BPQ по III признаку. Отсюда ∠APQ = ∠BPQ. Для M = PQ∩AB имеем AP = BP, PM — общая и ∠APM = ∠MPB, поэтому △APM = △BPM по I признаку; следовательно, AM = BM.';
}
})();
