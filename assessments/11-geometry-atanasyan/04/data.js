(function(){
'use strict';
const pool=window.KTP_G11_VECTOR_QUESTION_POOL;
if(!pool)throw new Error('Load vector question bank before thematic assessments');
// Positions implement the thematic matrix; variants deliberately rotate task templates.
const independentMatrix=[['directed',0],['equality',0],['difference',0],['chain',0],['scale',0],['coplanar',0],['basis',4]];
const controlMatrix=[['directed',0],['equality',0],['addition',0],['difference',0],['chain',0],['scale',0],['solid',0],['coplanar',0],['basis',1],['diagnostic',4]];
function build(matrix,id){
  return {id,tasks:matrix.map(([mode,index],i)=>{
    // Keep concept/error positions fixed. Alternate applied templates at the same difficulty.
    const rotated=(id%2===0&&index===0&&['chain','scale'].includes(mode))?1:index;
    const item=pool(mode,id)[rotated],criterion=item.errorAnalysis?'1 балл — обнаружена ошибка; 1 балл — исправление обосновано.':'1 балл — верный способ или обоснование; 1 балл — правильный результат.';
    return {...item,answer:item.answerCore,points:2,position:i+1,
      solution:item.solution+' Критерии: '+criterion,
      criteria:[{points:1,text:item.errorAnalysis?'Обнаружить ошибку':'Выбрать и обосновать действие'},{points:1,text:item.errorAnalysis?'Обосновать исправление':'Получить верный результат'}]};
  })};
}
window.KTP_ASSESSMENT_DATA={
 meta:{rowId:'11-geometry-atanasyan',grade:11,subject:'Геометрия',book:'Атанасян · Бутузов · Кадомцев и др.',year:'2026/27',topic:'04',
  sourceNote:'Глава VI, §§1–3, пп. 63–70 учебника Атанасяна, редакция 2019. Авторские задачи KTP 3.0: направленные отрезки, векторные равенства и коэффициенты разложения. Координатный метод, скалярное произведение и движения относятся к серии 05.'},
 topic:{title:'Векторы в пространстве',source:'Атанасян: глава VI, пп. 63–70; уроки 33–44.',
  independent:{duration:'30–35 минут',maxScore:14,purpose:'Проверить обозначения, равенство, разность, цепочку, умножение на число, компланарность и анализ условия разложения.',variants:Array.from({length:6},(_,i)=>build(independentMatrix,i+1))},
  control:{duration:'45 минут',maxScore:20,purpose:'Проверить весь путь от направленного отрезка до разложения в многограннике и анализа рассуждения о единственности.',variants:Array.from({length:6},(_,i)=>build(controlMatrix,i+1))}
 }
};
})();
