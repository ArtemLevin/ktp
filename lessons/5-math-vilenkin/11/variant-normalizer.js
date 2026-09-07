(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S?.lessons)return;
const fmt=n=>(Math.round((n+Number.EPSILON)*10000)/10000).toFixed(4).replace(/0+$/,'').replace(/\.$/,'').replace('.',',');
const task=(text,answer,points,skill)=>({text,answer,solution:'',points,skill});
function generated(i,v){
 const a=1.2+0.1*v,b=2+v,c=0.2+0.05*v,d=0.5+0.1*v;
 if(i<=3)return[
  [`Вычислите ${fmt(a)}·${b}.`,fmt(a*b)],
  [`Вычислите ${fmt(a+0.25)}·${b+1}.`,fmt((a+0.25)*(b+1))],
  [`Оцените ${fmt(a+2)}·${b}.`,`Около ${Math.round(a+2)*b}.`]
 ];
 if(i<=7)return[
  [`Вычислите ${fmt(a*b)}:${b}.`,fmt(a)],
  [`Вычислите ${fmt((a+0.4)*(b+1))}:${b+1}.`,fmt(a+0.4)],
  [`Проверьте равенство ${fmt(a*b)}:${b}=${fmt(a)}.`,`Верно: ${fmt(a)}·${b}=${fmt(a*b)}.`]
 ];
 if(i===8){const p=[10,100,1000][(v-1)%3];return[[`Вычислите ${fmt(a)}·${p}.`,fmt(a*p)],[`Вычислите ${fmt(c)}·${p}.`,fmt(c*p)],[`На сколько разрядов меняется положение цифр при умножении на ${p}?`,String(Math.log10(p))]]}
 if(i<=12)return[
  [`Вычислите ${fmt(a)}·${fmt(c)}.`,fmt(a*c)],
  [`Вычислите ${fmt(a+0.5)}·${fmt(d)}.`,fmt((a+0.5)*d)],
  [`Какой порядок результата у ${fmt(a+3)}·${fmt(c)}?`,`Около ${fmt((a+3)*c)}.`]
 ];
 if(i===13)return[
  [`Преобразуйте ${fmt(a*b)}:${fmt(c)} к делителю ${Math.round(c*100)}.`,`${fmt(a*b*100)}:${Math.round(c*100)}.`],
  [`Верно ли ${fmt(a)}:${fmt(c)}=${fmt(a*10)}:${fmt(c*10)}?`,'Верно.'],
  [`На что умножить ${fmt(c)}, чтобы получить натуральное число?`,`На ${c<1?100:10}.`]
 ];
 if(i<=16)return[
  [`Вычислите ${fmt(a*d)}:${fmt(d)}.`,fmt(a)],
  [`Вычислите ${fmt((a+1)*c)}:${fmt(c)}.`,fmt(a+1)],
  [`Что больше: ${fmt(a)} или ${fmt(a)}:${fmt(c)}?`,c<1?'Частное больше.':'Зависит от делителя.']
 ];
 if(i===17)return[
  [`Вычислите ${fmt(a)}·${b}+${fmt(a*b)}:${b}.`,fmt(a*b+a)],
  [`Решите ${fmt(c)}x=${fmt(c*(v+4))}.`,`x=${v+4}.`],
  [`Вычислите (${fmt(a*b)}:${b}+1)·0,5.`,fmt((a+1)*0.5)]
 ];
 if(i===18)return[
  [`До вычисления на калькуляторе оцените ${fmt(a+8)}·${fmt(c+0.2)}.`,`Около ${fmt((a+8)*(c+0.2))}.`],
  [`Калькулятор показывает ${fmt(a*b*10)} для ${fmt(a)}·${b}. Разумен ли результат?`,`Нет; точный результат ${fmt(a*b)}.`],
  [`Проверьте калькулятором ${fmt(a*b)}:${b}.`,fmt(a)]
 ];
 return[
  [`Вычислите ${fmt(a)}·${b}.`,fmt(a*b)],
  [`Вычислите ${fmt(a*b)}:${fmt(c+0.1)}.`,fmt((a*b)/(c+0.1))],
  [`Решите ${fmt(c)}x=${fmt(c*(v+5))}.`,`x=${v+5}.`]
 ];
}
S.lessons.forEach((lesson,i)=>['independent','control'].forEach(kind=>{const block=lesson[kind];if(!block?.variants)return;block.variants.forEach(v=>{const g=generated(i,Number(v.id)||1);for(let j=0;j<Math.min(3,v.tasks.length);j++){const old=v.tasks[j];v.tasks[j]=task(g[j][0],g[j][1],old.points,old.skill)}})}));
})();
