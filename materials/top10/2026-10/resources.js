(function(){
'use strict';
const rows=[
{slug:'8a_l18',row:'8-algebra-makarychev',idx:1,local:'03',title:'Квадратные корни и уравнение x² = a'},
{slug:'7a_l17',row:'7-algebra-makarychev',idx:0,local:'17',title:'Текстовые задачи с помощью уравнений'},
{slug:'6m_l30',row:'6-math-vilenkin',idx:1,local:'12',title:'Сложение и вычитание дробей и смешанных чисел'},
{slug:'11a_l18',row:'11-algebra-alimov',idx:1,local:'02',title:'Производная и промежутки монотонности'},
{slug:'9a_l18',row:'9-algebra-makarychev',idx:0,local:'18',title:'Итоговая диагностика: числа и вычисления'}
];
const registry=window.KTP_LESSON_RESOURCE_PATCHES||(window.KTP_LESSON_RESOURCE_PATCHES={});
for(const p of rows){
 const key=p.row+'::'+p.idx+'::'+p.local;
 const items=[];
 for(const [line,lineTitle] of [['standard','стандартная линия'],['strong','для сильных учеников']]){
  for(const [aud,audTitle] of [['student','учащимся'],['teacher','преподавателю']]){
   items.push({
    kind:'printable',
    audience:aud,
    label:'54 упражнения для тотального закрепления · '+lineTitle+' · '+audTitle,
    format:aud==='teacher'?'Web · ответы и решения · печать/PDF':'Web · печать/PDF',
    title:p.title,
    href:'../../../materials/top10/2026-10/54.html?item='+p.slug+'&line='+line+'&audience='+aud
   });
  }
 }
 const prev=registry[key]||[];
 const fresh=items.filter(x=>!prev.some(old=>old.href===x.href));
 registry[key]=prev.concat(fresh);
}
})();