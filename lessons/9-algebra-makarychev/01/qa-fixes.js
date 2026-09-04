(function(){
'use strict';
const series=window.KTP_LESSON_SERIES;
if(!series?.lessons)return;
const lesson11=series.lessons.find(x=>x.id==='11');
const task=lesson11?.homework?.optional?.find(x=>x.text?.includes('минимальное число знаков'));
if(task)task.answer='4 знака: при округлении до 10⁻⁴ ошибка не превосходит 0,00005<0,0001.';
})();
