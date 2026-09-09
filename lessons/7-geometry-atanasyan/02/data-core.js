(function(){'use strict';const S=window.KTP_LESSON_SERIES;if(!S)return;
const ptsI=[1,1,2,3,3],ptsC=[1,1,2,2,3,5];
const rotate=(a,n)=>a.map((_,i)=>a[(i+n)%a.length]);
const task=(x,p,skill)=>({text:x.text,answer:x.answer,skill:x.skill||skill,points:p});
function work(pool,count,points,purpose){return{duration:count===5?'12–15 минут':'20–25 минут',maxScore:points.reduce((a,b)=>a+b,0),purpose,variants:Array.from({length:6},(_,i)=>({id:i+1,tasks:rotate(pool,i).slice(0,count).map((x,j)=>task(x,points[j],x.skill||'Навык урока'))}))};}
window.KTP_ADD_GEO7_LESSON=function(d){const p=d.practice||[];d.homework=d.homework||{required:p.slice(0,6),optional:p.slice(6,8)};d.independent=work(p,5,ptsI,'Короткая проверка ключевого навыка урока.');d.control=work(p,6,ptsC,'Поурочный контроль применения определения, свойства или признака и качества обоснования.');S.lessons.push(d);};})();
