(function(){
'use strict';
const S=window.KTP_LESSON_SERIES,defs=window.KTP_G11_COORDINATE_DEFINITIONS,pool=window.KTP_G11_COORDINATE_QUESTION_POOL;
const grading=max=>[{grade:5,min:Math.ceil(max*.85),max},{grade:4,min:Math.ceil(max*.65),max:Math.ceil(max*.85)-1},{grade:3,min:Math.ceil(max*.45),max:Math.ceil(max*.65)-1},{grade:2,min:0,max:Math.ceil(max*.45)-1}];
function work(mode,kind){const quick=kind==='independent',points=quick?[2,2,2,2,2]:[2,2,2,3,2,3],maxScore=quick?10:14;
 return {title:quick?'Самостоятельная работа':'Поурочный контроль',duration:quick?'12–15 минут':'20–25 минут',maxScore,grading:grading(maxScore),purpose:'Проверить действие, условия формулы и самостоятельное исправление ошибки.',variants:Array.from({length:6},(_,v)=>{const p=pool(mode,v+(quick?1:7)),indices=quick?[0,1,2,3,4]:[0,1,2,5,4,v%2?9:7];return {id:v+1,tasks:indices.map((n,i)=>({...p[n],points:points[i],criteria:points[i]===3?['2 балла: метод и обоснование.','1 балл: верный результат.']:['1 балл: действие или обнаружение ошибки.','1 балл: результат или обоснованное исправление.']}))};})};
}
for(const [i,d] of defs.entries()){
 const p=pool(d.mode,1),globalNumber=45+i;
 S.lessons.push({id:String(i+1).padStart(2,'0'),number:i+1,globalNumber,week:23+Math.floor(i/2),mode:d.mode,title:d.title,
 prerequisites:[i===0?'Операции с векторами из уроков 33–44.':'Координатные действия и результаты предыдущих уроков.','Чтение пространственного рисунка и проверка условий правила.'],
 objectives:['Применять правило: '+d.title.toLowerCase()+'.','Обосновывать ход решения и исправлять типичную ошибку.'],
 theory:d.theory.map((html,j)=>({title:['Основное правило','Применение и условия','Проверка и границы'][j],html,spatialFigure:j===0?d.scene:null})),
 examples:[0,1,4].map((n,j)=>({title:['Полный разбор','Другая ситуация','Анализ ошибки'][j],problem:p[n].text,idea:'Определите объект и условия используемого правила.',solution:p[n].solution,answer:p[n].answerCore,check:'Выполните обратную подстановку или проверьте геометрический инвариант.',audit:p[n].audit})),
 mistakes:[{title:d.mistake,explanation:p[4].answerCore},{title:'Третья координата потеряна',explanation:'Записывайте все три координаты и порядок действий.'},{title:'Ответ без условия',explanation:'Проверьте ненулевые направления, ортонормированность системы и тип геометрического объекта.'},{title:'Размер снят с рисунка',explanation:'Вычисляйте по модели; экранная проекция зависит от камеры.'}],
 practice:pool(d.mode,13).slice(0,8),homework:{required:pool(d.mode,14).slice(0,6),optional:pool(d.mode,15).slice(8,10)},
 independent:work(d.mode,'independent'),control:work(d.mode,'control'),summary:[...d.theory,'Объект → условия → формула → результат → проверка.'],
 resources:[{label:'Опорный модуль',format:'Web',title:'Вся тема',href:S.meta.topicHref},{label:'Исследование',format:'Web',title:'Координатная лаборатория',href:'../../../labs/11-geometry-atanasyan/coordinate-space/index.html'}],
 source:{textbook:'Л. С. Атанасян и др., Геометрия 10–11, редакция 2019.',section:'Глава VII, пп. '+d.point,assessment:d.extension?'Расширение KTP: проверяется отдельно от базового тематического результата ФРП.':'Базовый координатный результат ФРП; п.79* — адресный инструмент расстояния до плоскости.'},milestone:i===11?'Диагностика серии':undefined});
}
})();
