(function(){
'use strict';
const series=window.KTP_LESSON_SERIES;
if(!series)return;
const byId=id=>series.lessons.find(x=>x.id===id);
const l6=byId('06');
if(l6){
  l6.independent?.variants?.forEach(v=>{const b=Number(v.id)+3;if(v.tasks?.[1])v.tasks[1].answer=`${2*b}/(x+1)`;});
  l6.control?.variants?.forEach(v=>{const a=Number(v.id)+1,b=Number(v.id)+3;if(v.tasks?.[1])v.tasks[1].answer=`${2*a}/(x+${b})`;});
}
const l7=byId('07');
if(l7){
  l7.independent?.variants?.forEach(v=>{const a=Number(v.id)+1,b=Number(v.id)+3;if(v.tasks?.[0]){v.tasks[0].text=`Укажите один общий знаменатель для 1/(${a}x) и 1/(${b}x).`;v.tasks[0].answer=`${a*b}x`;}});
}
const l12=byId('12');
if(l12){
  l12.independent?.variants?.forEach(v=>{const a=Number(v.id)+1;if(v.tasks?.[2])v.tasks[2].answer=`1, x≠${a}, x≠−${a}`;});
  l12.control?.variants?.forEach(v=>{const b=Number(v.id)+3;if(v.tasks?.[2])v.tasks[2].answer=`1, x≠${b}, x≠−${b}`;});
}
const l13=byId('13');
if(l13){
  l13.independent?.variants?.forEach(v=>{const a=Number(v.id)+1;if(v.tasks?.[1])v.tasks[1].answer=`${2*a}, x≠${a}, x≠−${a}`;});
  l13.control?.variants?.forEach(v=>{const a=Number(v.id)+1,b=Number(v.id)+3;if(v.tasks?.[1])v.tasks[1].answer=`1, x≠${a}, x≠−${a}`;if(v.tasks?.[2])v.tasks[2].answer=`1, x≠${b}, x≠−${b}`;});
}
})();
