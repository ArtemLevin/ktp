(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S?.lessons)return;
const taskArrays=lesson=>{
 const out=[lesson.practice,lesson.homework?.required,lesson.homework?.optional];
 for(const kind of ['independent','control'])for(const v of lesson[kind]?.variants||[])out.push(v.tasks);
 return out.filter(Array.isArray);
};
const patch=(lesson,predicate,replacement)=>{
 for(const list of taskArrays(lesson))for(const t of list){if(predicate(t)){const next=replacement(t);Object.assign(t,next);}}
};
const byGlobal=n=>S.lessons.find(l=>l.globalNumber===n);
const l48=byGlobal(48);
if(l48)patch(l48,t=>String(t.text||'').includes('равноудалённых от двух пересекающихся прямых'),()=>({text:'Назовите ГМТ точек M, удовлетворяющих условию M∈a, где a — заданная прямая.',answer:'Прямая a.',skill:'Простой пример ГМТ'}));
const l50=byGlobal(50);
if(l50){
 patch(l50,t=>String(t.text||'').startsWith('Центр окружности касается обеих сторон угла'),()=>({text:'Точка O находится внутри угла и равноудалена от его сторон. Где лежит O?',answer:'На биссектрисе угла.',skill:'Обратная теорема'}));
 patch(l50,t=>String(t.text||'').startsWith('Какая окружность связана с биссектрисой как ГМТ?'),()=>({text:'Какое равенство расстояний выполняется для любой точки биссектрисы?',answer:'Расстояния до сторон угла равны.',skill:'Прямая теорема'}));
}
const l53=byGlobal(53);
if(l53)patch(l53,t=>String(t.text||'').startsWith('Почему внешний вид чертежа сам по себе не доказывает касание?'),t=>({...t,answer:'Нужно установить, что у прямой и окружности ровно одна общая точка.'}));
})();
